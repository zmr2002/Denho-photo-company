package jp.co.tianho.api.media;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.matchesPattern;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.util.List;
import java.util.UUID;
import javax.imageio.ImageIO;
import jp.co.tianho.api.PostgresTestConfiguration;
import jp.co.tianho.api.auth.AdministratorPrincipal;
import jp.co.tianho.api.auth.AdministratorRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Import(PostgresTestConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MediaLifecycleTests {

    private static final UUID ADMIN_ID = UUID.fromString("cb1b0407-771d-48c4-a729-7ff199544a93");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcClient jdbcClient;

    @MockitoBean
    private MediaObjectStorage objectStorage;

    @Autowired
    private MediaLifecycleService mediaLifecycleService;

    @BeforeEach
    void insertAdministrator() {
        jdbcClient.sql("""
                        INSERT INTO administrator_users (
                            id, email, display_name, password_hash, password_scheme, role, active, verified_at
                        ) VALUES (
                            :id, 'media@example.com', 'Media administrator', 'unused',
                            'ARGON2ID', 'ADMIN', TRUE, CURRENT_TIMESTAMP
                        )
                        """)
                .param("id", ADMIN_ID)
                .update();
    }

    @Test
    void uploadsReencodedMasterAndThumbnailWithImmutableKeys() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "wide.png", MediaType.IMAGE_PNG_VALUE, png(5000, 10));

        mockMvc.perform(multipart("/api/v1/admin/media")
                        .file(file)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR)))
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.contentType").value("image/png"))
                .andExpect(jsonPath("$.width").value(4096))
                .andExpect(jsonPath("$.height").value(8))
                .andExpect(jsonPath("$.url").value(matchesPattern(
                        "/media/original/[0-9a-f-]{36}\\.png")))
                .andExpect(jsonPath("$.thumbnailUrl").value(matchesPattern(
                        "/media/thumbnail/[0-9a-f-]{36}\\.png")));

        ArgumentCaptor<byte[]> bytes = ArgumentCaptor.forClass(byte[].class);
        verify(objectStorage, times(2)).put(anyString(), eq("image/png"), bytes.capture());
        List<byte[]> stored = bytes.getAllValues();
        BufferedImage master = ImageIO.read(new ByteArrayInputStream(stored.get(0)));
        BufferedImage thumbnail = ImageIO.read(new ByteArrayInputStream(stored.get(1)));
        assertThat(master.getWidth()).isEqualTo(4096);
        assertThat(thumbnail.getWidth()).isEqualTo(480);
    }

    @Test
    void rejectsDisguisedOversizedAndDuplicateUploads() throws Exception {
        mockMvc.perform(multipart("/api/v1/admin/media")
                        .file(new MockMultipartFile("file", "fake.jpg", "image/jpeg", png(10, 10)))
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR)))
                        .with(csrf()))
                .andExpect(status().isUnprocessableContent());

        byte[] excessiveDimensions = png(1, 1);
        ByteBuffer.wrap(excessiveDimensions, 16, 8).putInt(10_000).putInt(6_000);
        mockMvc.perform(multipart("/api/v1/admin/media")
                        .file(new MockMultipartFile("file", "huge.png", "image/png", excessiveDimensions))
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR)))
                        .with(csrf()))
                .andExpect(status().isUnprocessableContent());

        mockMvc.perform(multipart("/api/v1/admin/media")
                        .file(new MockMultipartFile(
                                "file", "large.png", "image/png", new byte[(int) ImageUploadProcessor.MAX_BYTES + 1]))
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR)))
                        .with(csrf()))
                .andExpect(status().isUnprocessableContent());

        byte[] image = png(20, 20);
        MockMultipartFile first = new MockMultipartFile("file", "first.png", "image/png", image);
        MockMultipartFile second = new MockMultipartFile("file", "second.png", "image/png", image);
        mockMvc.perform(multipart("/api/v1/admin/media").file(first)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR))).with(csrf()))
                .andExpect(status().isCreated());
        mockMvc.perform(multipart("/api/v1/admin/media").file(second)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR))).with(csrf()))
                .andExpect(status().isConflict());
    }

    @Test
    void protectsReferencesAndEnforcesRecycleRetention() throws Exception {
        UUID assetId = insertAsset();
        UUID resourceId = UUID.randomUUID();
        jdbcClient.sql("""
                        INSERT INTO media_references (asset_id, resource_type, resource_id, field_name)
                        VALUES (:assetId, 'ARTICLE', :resourceId, 'hero')
                        """)
                .param("assetId", assetId)
                .param("resourceId", resourceId)
                .update();

        mockMvc.perform(post("/api/v1/admin/media/{id}/trash", assetId)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR))).with(csrf()))
                .andExpect(status().isConflict());

        jdbcClient.sql("DELETE FROM media_references WHERE asset_id = :assetId")
                .param("assetId", assetId)
                .update();
        mockMvc.perform(post("/api/v1/admin/media/{id}/trash", assetId)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR))).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("TRASHED"))
                .andExpect(jsonPath("$.purgeAfter").isNotEmpty());
        mockMvc.perform(post("/api/v1/admin/media/{id}/restore", assetId)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR))).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        mockMvc.perform(post("/api/v1/admin/media/{id}/trash", assetId)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR))).with(csrf()))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/admin/media/{id}/purge", assetId)
                        .with(authentication(authenticationFor(AdministratorRole.ADMIN))).with(csrf()))
                .andExpect(status().isConflict());

        jdbcClient.sql("""
                        UPDATE media_assets SET purge_after = CURRENT_TIMESTAMP - INTERVAL '1 second'
                        WHERE id = :id
                        """)
                .param("id", assetId)
                .update();
        mockMvc.perform(post("/api/v1/admin/media/{id}/purge", assetId)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR))).with(csrf()))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/v1/admin/media/{id}/purge", assetId)
                        .with(authentication(authenticationFor(AdministratorRole.ADMIN))).with(csrf()))
                .andExpect(status().isNoContent());

        String state = jdbcClient.sql("SELECT status::text FROM media_assets WHERE id = :id")
                .param("id", assetId)
                .query(String.class)
                .single();
        Long cleanupRecords = jdbcClient.sql("SELECT count(*) FROM media_cleanup_records WHERE asset_id = :id")
                .param("id", assetId)
                .query(Long.class)
                .single();
        assertThat(state).isEqualTo("DELETED");
        assertThat(cleanupRecords).isEqualTo(1);
        String cleanupResult = jdbcClient.sql("SELECT result FROM media_cleanup_records WHERE asset_id = :id")
                .param("id", assetId)
                .query(String.class)
                .single();
        assertThat(cleanupResult).isEqualTo("DELETED");
        verify(objectStorage).delete("original/" + assetId + ".png");
        verify(objectStorage).delete("thumbnail/" + assetId + ".png");
    }

    @Test
    void retainsFailedObjectCleanupForRetry() throws Exception {
        UUID assetId = insertAsset();
        mockMvc.perform(post("/api/v1/admin/media/{id}/trash", assetId)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR))).with(csrf()))
                .andExpect(status().isOk());
        jdbcClient.sql("""
                        UPDATE media_assets SET purge_after = CURRENT_TIMESTAMP - INTERVAL '1 second'
                        WHERE id = :id
                        """)
                .param("id", assetId)
                .update();
        doThrow(new RuntimeException("storage unavailable"))
                .when(objectStorage).delete("thumbnail/" + assetId + ".png");

        mockMvc.perform(post("/api/v1/admin/media/{id}/purge", assetId)
                        .with(authentication(authenticationFor(AdministratorRole.ADMIN))).with(csrf()))
                .andExpect(status().isNoContent());

        assertThat(jdbcClient.sql("SELECT status::text FROM media_assets WHERE id = :id")
                .param("id", assetId).query(String.class).single()).isEqualTo("DELETED");
        assertThat(jdbcClient.sql("SELECT result FROM media_cleanup_records WHERE asset_id = :id")
                .param("id", assetId).query(String.class).single()).isEqualTo("FAILED");

        reset(objectStorage);
        mediaLifecycleService.retryIncompleteCleanups();

        assertThat(jdbcClient.sql("SELECT result FROM media_cleanup_records WHERE asset_id = :id")
                .param("id", assetId).query(String.class).single()).isEqualTo("DELETED");
        verify(objectStorage).delete("original/" + assetId + ".png");
        verify(objectStorage).delete("thumbnail/" + assetId + ".png");
    }

    @Test
    void recordsContentReferencesForManagedImages() throws Exception {
        UUID assetId = insertAsset();
        mockMvc.perform(post("/api/v1/admin/articles")
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR)))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "locale":"ja","slug":"managed-image","title":"Managed image",
                                  "excerpt":"Excerpt","category":"Test","authorName":"Editorial Team",
                                  "heroImagePath":"/media/original/%s.png","heroTone":"neutral",
                                  "displayOrder":0,"relatedServices":[],"demo":false,
                                  "blocks":[{"type":"paragraph","body":"Body","imageTone":"neutral","sortOrder":0}]
                                }
                                """.formatted(assetId)))
                .andExpect(status().isCreated());

        Long references = jdbcClient.sql("SELECT count(*) FROM media_references WHERE asset_id = :assetId")
                .param("assetId", assetId)
                .query(Long.class)
                .single();
        assertThat(references).isEqualTo(1);
        mockMvc.perform(post("/api/v1/admin/media/{id}/trash", assetId)
                        .with(authentication(authenticationFor(AdministratorRole.EDITOR))).with(csrf()))
                .andExpect(status().isConflict());
    }

    @Test
    void servesOnlyStrictImmutableMediaPaths() throws Exception {
        UUID id = insertAsset();
        byte[] image = png(12, 12);
        when(objectStorage.get("original/" + id + ".png")).thenReturn(image);

        mockMvc.perform(get("/api/v1/public/media/original/{filename}", id + ".png"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", matchesPattern(".*max-age=31536000.*immutable.*")))
                .andExpect(header().string("Content-Type", "image/png"));
        mockMvc.perform(get("/api/v1/public/media/original/not-a-file.png"))
                .andExpect(status().isNotFound());

        jdbcClient.sql("""
                        UPDATE media_assets SET status = 'TRASHED', trashed_at = CURRENT_TIMESTAMP,
                            purge_after = CURRENT_TIMESTAMP + INTERVAL '30 days'
                        WHERE id = :id
                        """)
                .param("id", id)
                .update();
        mockMvc.perform(get("/api/v1/public/media/original/{filename}", id + ".png"))
                .andExpect(status().isNotFound());
    }

    private UUID insertAsset() {
        UUID id = UUID.randomUUID();
        jdbcClient.sql("""
                        INSERT INTO media_assets (
                            id, object_key, thumbnail_key, original_filename, content_type,
                            byte_size, width, height, sha256, created_by
                        ) VALUES (
                            :id, :objectKey, :thumbnailKey, 'asset.png', 'image/png',
                            10, 10, 10, :sha256, :createdBy
                        )
                        """)
                .param("id", id)
                .param("objectKey", "original/" + id + ".png")
                .param("thumbnailKey", "thumbnail/" + id + ".png")
                .param("sha256", "b".repeat(64))
                .param("createdBy", ADMIN_ID)
                .update();
        return id;
    }

    private byte[] png(int width, int height) throws Exception {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        java.awt.Graphics2D graphics = image.createGraphics();
        graphics.setColor(Color.BLUE);
        graphics.fillRect(0, 0, width, height);
        graphics.dispose();
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }

    private Authentication authenticationFor(AdministratorRole role) {
        AdministratorPrincipal principal = new AdministratorPrincipal(
                ADMIN_ID, "media@example.com", "Media administrator", role.name());
        return UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.authorities());
    }
}
