package jp.co.tianho.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@Import(PostgresTestConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
class ApiApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void applicationStartsWithPostgres() {
    }

    @Test
    void livenessEndpointIsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health/liveness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void openApiContractIsPublic() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("Tianho Website API"))
                .andExpect(jsonPath("$.info.version").value("v1"));
    }

    @Test
    void administrationEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/admin/audit-events"))
                .andExpect(status().isForbidden());
    }

    @Test
    void publicApiNamespaceDoesNotRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/public/articles"))
                .andExpect(status().isNotFound());
    }
}
