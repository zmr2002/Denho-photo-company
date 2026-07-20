package jp.co.tianho.api.shared.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfiguration {

    @Bean
    OpenAPI tianhoOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Denho Website API")
                .version("v1")
                .description("HTTP contract for the public website and administration area."));
    }
}
