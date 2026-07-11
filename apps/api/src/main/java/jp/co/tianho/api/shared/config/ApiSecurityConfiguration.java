package jp.co.tianho.api.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.security.web.context.SecurityContextRepository;
import jp.co.tianho.api.auth.AbsoluteSessionExpirationFilter;

@Configuration
@EnableMethodSecurity
public class ApiSecurityConfiguration {

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    SecurityFilterChain apiSecurityFilterChain(
            HttpSecurity http,
            SecurityContextRepository securityContextRepository,
            AbsoluteSessionExpirationFilter absoluteSessionExpirationFilter) throws Exception {
        return http
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.GET,
                                "/actuator/health/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html")
                        .permitAll()
                        .requestMatchers("/api/v1/public/**")
                        .permitAll()
                        .requestMatchers(
                                "/api/v1/auth/login",
                                "/api/v1/auth/session",
                                "/api/v1/auth/csrf",
                                "/api/v1/auth/mfa/bind",
                                "/api/v1/auth/mfa/verify",
                                "/api/v1/auth/mfa/recovery")
                        .permitAll()
                        .requestMatchers("/api/v1/admin/users/**", "/api/v1/admin/audit-events/**")
                        .hasRole("ADMIN")
                        .requestMatchers("/api/v1/admin/media/*/purge")
                        .hasRole("ADMIN")
                        .requestMatchers(
                                "/api/v1/admin/articles/*/publish",
                                "/api/v1/admin/articles/*/archive",
                                "/api/v1/admin/articles/*/restore",
                                "/api/v1/admin/works/*/publish",
                                "/api/v1/admin/works/*/archive",
                                "/api/v1/admin/works/*/restore",
                                "/api/v1/admin/notices/*/publish",
                                "/api/v1/admin/notices/*/archive",
                                "/api/v1/admin/notices/*/restore")
                        .hasRole("ADMIN")
                        .requestMatchers("/api/v1/admin/**")
                        .hasAnyRole("ADMIN", "EDITOR")
                        .anyRequest()
                        .authenticated())
                .securityContext(context -> context
                        .securityContextRepository(securityContextRepository)
                        .requireExplicitSave(true))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(new HttpStatusEntryPoint(org.springframework.http.HttpStatus.UNAUTHORIZED)))
                .logout(logout -> logout
                        .logoutUrl("/api/v1/auth/logout")
                        .logoutSuccessHandler((request, response, authentication) ->
                                response.setStatus(org.springframework.http.HttpStatus.NO_CONTENT.value()))
                        .invalidateHttpSession(true)
                        .clearAuthentication(true))
                .addFilterAfter(absoluteSessionExpirationFilter, SecurityContextHolderFilter.class)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .build();
    }
}
