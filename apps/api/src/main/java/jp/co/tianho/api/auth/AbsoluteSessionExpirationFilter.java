package jp.co.tianho.api.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class AbsoluteSessionExpirationFilter extends OncePerRequestFilter {

    static final String ABSOLUTE_EXPIRATION_ATTRIBUTE = "TIANHO_ABSOLUTE_SESSION_EXPIRATION";

    private final Duration absoluteTimeout;
    private final SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();

    AbsoluteSessionExpirationFilter(
            @Value("${tianho.auth.session.absolute-timeout:8h}") Duration absoluteTimeout) {
        this.absoluteTimeout = absoluteTimeout;
    }

    Instant newExpiration() {
        return Instant.now().plus(absoluteTimeout);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            HttpSession session = request.getSession(false);
            if (session != null) {
                Instant expiration = (Instant) session.getAttribute(ABSOLUTE_EXPIRATION_ATTRIBUTE);
                if (expiration == null) {
                    expiration = newExpiration();
                    session.setAttribute(ABSOLUTE_EXPIRATION_ATTRIBUTE, expiration);
                }
                if (!expiration.isAfter(Instant.now())) {
                    logoutHandler.logout(request, response, authentication);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/problem+json");
                    response.getWriter().write("""
                            {"title":"Session expired","status":401,"type":"/problems/session-expired"}
                            """);
                    return;
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
