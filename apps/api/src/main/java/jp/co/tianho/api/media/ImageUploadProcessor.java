package jp.co.tianho.api.media;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Iterator;
import java.util.Locale;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class ImageUploadProcessor {

    static final long MAX_BYTES = 15L * 1024 * 1024;
    static final long MAX_PIXELS = 50_000_000L;
    private static final int MASTER_EDGE = 4096;
    private static final int THUMBNAIL_EDGE = 480;

    public synchronized ProcessedImage process(MultipartFile file) {
        String filename = safeFilename(file.getOriginalFilename());
        if (file.isEmpty() || file.getSize() > MAX_BYTES) {
            throw new ImageValidationException("Image must be between 1 byte and 15 MB");
        }
        try {
            byte[] original = file.getBytes();
            ImageFormat format = detectFormat(original, filename);
            ImageDimensions dimensions = readDimensions(original, format);
            if ((long) dimensions.width() * dimensions.height() > MAX_PIXELS) {
                throw new ImageValidationException("Image exceeds the 50 megapixel limit");
            }
            BufferedImage decoded = decode(original);
            if (decoded.getWidth() != dimensions.width() || decoded.getHeight() != dimensions.height()) {
                throw new ImageValidationException("Decoded image dimensions are inconsistent");
            }
            BufferedImage master = resize(decoded, MASTER_EDGE, format);
            BufferedImage thumbnail = resize(decoded, THUMBNAIL_EDGE, format);
            return new ProcessedImage(
                    filename,
                    format.contentType(),
                    format.extension(),
                    master.getWidth(),
                    master.getHeight(),
                    sha256(original),
                    encode(master, format),
                    encode(thumbnail, format));
        } catch (IOException exception) {
            throw new ImageValidationException("Image could not be decoded");
        }
    }

    private String safeFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new ImageValidationException("Image filename is required");
        }
        String normalized = originalFilename.replace('\\', '/');
        String filename = normalized.substring(normalized.lastIndexOf('/') + 1).strip();
        if (filename.isBlank() || filename.length() > 240) {
            throw new ImageValidationException("Image filename is invalid");
        }
        return filename;
    }

    private ImageFormat detectFormat(byte[] bytes, String filename) {
        String lowerFilename = filename.toLowerCase(Locale.ROOT);
        boolean jpeg = bytes.length >= 3
                && (bytes[0] & 0xff) == 0xff && (bytes[1] & 0xff) == 0xd8 && (bytes[2] & 0xff) == 0xff;
        boolean png = bytes.length >= 8
                && (bytes[0] & 0xff) == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4e && bytes[3] == 0x47
                && bytes[4] == 0x0d && bytes[5] == 0x0a && bytes[6] == 0x1a && bytes[7] == 0x0a;
        if (jpeg && (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg"))) {
            return ImageFormat.JPEG;
        }
        if (png && lowerFilename.endsWith(".png")) {
            return ImageFormat.PNG;
        }
        throw new ImageValidationException("Only correctly named JPEG and PNG images are accepted");
    }

    private ImageDimensions readDimensions(byte[] bytes, ImageFormat expectedFormat) throws IOException {
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            if (input == null) throw new ImageValidationException("Image could not be decoded");
            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) throw new ImageValidationException("Image format is not supported");
            ImageReader reader = readers.next();
            try {
                String detected = reader.getFormatName().toLowerCase(Locale.ROOT);
                if (!expectedFormat.matchesReader(detected)) {
                    throw new ImageValidationException("Image content does not match its file type");
                }
                reader.setInput(input, true, true);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (width <= 0 || height <= 0) throw new ImageValidationException("Image dimensions are invalid");
                return new ImageDimensions(width, height);
            } finally {
                reader.dispose();
            }
        }
    }

    private BufferedImage decode(byte[] bytes) throws IOException {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));
        if (image == null) throw new ImageValidationException("Image could not be decoded");
        return image;
    }

    private BufferedImage resize(BufferedImage source, int maxEdge, ImageFormat format) {
        double scale = Math.min(1.0, (double) maxEdge / Math.max(source.getWidth(), source.getHeight()));
        int width = Math.max(1, (int) Math.round(source.getWidth() * scale));
        int height = Math.max(1, (int) Math.round(source.getHeight() * scale));
        int imageType = format == ImageFormat.PNG ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;
        BufferedImage target = new BufferedImage(width, height, imageType);
        Graphics2D graphics = target.createGraphics();
        try {
            graphics.setComposite(AlphaComposite.Src);
            if (format == ImageFormat.JPEG) {
                graphics.setColor(Color.WHITE);
                graphics.fillRect(0, 0, width, height);
            }
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            graphics.drawImage(source, 0, 0, width, height, null);
        } finally {
            graphics.dispose();
        }
        return target;
    }

    private byte[] encode(BufferedImage image, ImageFormat format) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName(format.writerFormat());
        if (!writers.hasNext()) throw new ImageValidationException("Image encoder is unavailable");
        ImageWriter writer = writers.next();
        try (ImageOutputStream imageOutput = ImageIO.createImageOutputStream(output)) {
            writer.setOutput(imageOutput);
            ImageWriteParam parameters = writer.getDefaultWriteParam();
            if (format == ImageFormat.JPEG && parameters.canWriteCompressed()) {
                parameters.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                parameters.setCompressionQuality(0.9f);
            }
            writer.write(null, new IIOImage(image, null, null), parameters);
        } finally {
            writer.dispose();
        }
        return output.toByteArray();
    }

    private String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    public record ProcessedImage(
            String originalFilename,
            String contentType,
            String extension,
            int width,
            int height,
            String sha256,
            byte[] masterBytes,
            byte[] thumbnailBytes) {
    }

    private record ImageDimensions(int width, int height) {
    }

    private enum ImageFormat {
        JPEG("image/jpeg", "jpg", "jpeg"),
        PNG("image/png", "png", "png");

        private final String contentType;
        private final String extension;
        private final String readerName;

        ImageFormat(String contentType, String extension, String readerName) {
            this.contentType = contentType;
            this.extension = extension;
            this.readerName = readerName;
        }

        String contentType() {
            return contentType;
        }

        String extension() {
            return extension;
        }

        String writerFormat() {
            return extension;
        }

        boolean matchesReader(String name) {
            return name.equals(readerName) || this == JPEG && name.equals("jpg");
        }
    }
}
