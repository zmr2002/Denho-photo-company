package jp.co.tianho.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Import(PostgresTestConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class OpenApiContractTests {

    private static final Path SNAPSHOT = Path.of("openapi.json");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void runtimeContractMatchesPublishedSnapshot() throws Exception {
        String response = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode actual = objectMapper.readTree(response);

        if ("true".equalsIgnoreCase(System.getenv("UPDATE_OPENAPI"))) {
            Files.writeString(SNAPSHOT, objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(actual) + "\n");
            return;
        }

        JsonNode expected = objectMapper.readTree(Files.readString(SNAPSHOT));
        assertThat(actual).isEqualTo(expected);
    }
}
