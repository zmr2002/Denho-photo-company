package jp.co.tianho.api.shared.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@ConditionalOnProperty(name = "tianho.security.origin-validation-enabled", havingValue = "true")
public class OriginValidationFilter extends OncePerRequestFilter {

    private final Set<String> allowedOrigins;

    public OriginValidationFilter(@Value("${tianho.security.allowed-origins}") String allowedOrigins) {
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::strip)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toUnmodifiableSet());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (isWrite(request)) {
            String origin = request.getHeader("Origin");
            if (origin == null || !allowedOrigins.contains(origin)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
                response.getWriter().write("""
                        {"type":"/problems/origin-rejected","title":"Request origin rejected","status":403}
                        """);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private boolean isWrite(HttpServletRequest request) {
        return switch (request.getMethod()) {
            case "POST", "PUT", "PATCH", "DELETE" -> true;
            default -> false;
        };
    }
}
