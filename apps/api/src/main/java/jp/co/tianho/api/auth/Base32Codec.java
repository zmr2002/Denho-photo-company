package jp.co.tianho.api.auth;

import java.io.ByteArrayOutputStream;
import java.util.Locale;

final class Base32Codec {

    private static final char[] ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".toCharArray();

    private Base32Codec() {
    }

    static String encode(byte[] bytes) {
        StringBuilder result = new StringBuilder((bytes.length * 8 + 4) / 5);
        int buffer = 0;
        int bits = 0;
        for (byte value : bytes) {
            buffer = (buffer << 8) | (value & 0xff);
            bits += 8;
            while (bits >= 5) {
                result.append(ALPHABET[(buffer >> (bits - 5)) & 31]);
                bits -= 5;
            }
        }
        if (bits > 0) {
            result.append(ALPHABET[(buffer << (5 - bits)) & 31]);
        }
        return result.toString();
    }

    static byte[] decode(String value) {
        String normalized = value.replace("=", "").replace(" ", "").toUpperCase(Locale.ROOT);
        ByteArrayOutputStream result = new ByteArrayOutputStream(normalized.length() * 5 / 8);
        int buffer = 0;
        int bits = 0;
        for (char character : normalized.toCharArray()) {
            int index = character >= 'A' && character <= 'Z'
                    ? character - 'A'
                    : character >= '2' && character <= '7' ? character - '2' + 26 : -1;
            if (index < 0) {
                throw new MfaVerificationException("TOTP secret format is invalid");
            }
            buffer = (buffer << 5) | index;
            bits += 5;
            if (bits >= 8) {
                result.write((buffer >> (bits - 8)) & 0xff);
                bits -= 8;
            }
        }
        return result.toByteArray();
    }
}
