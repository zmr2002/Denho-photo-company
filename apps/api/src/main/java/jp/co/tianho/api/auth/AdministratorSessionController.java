package jp.co.tianho.api.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AdministratorSessionController {

    private final AdministratorAuthenticationService authenticationService;
    private final SecurityContextRepository securityContextRepository;
    private final AbsoluteSessionExpirationFilter expirationFilter;

    public AdministratorSessionController(
            AdministratorAuthenticationService authenticationService,
            SecurityContextRepository securityContextRepository,
            AbsoluteSessionExpirationFilter expirationFilter) {
        this.authenticationService = authenticationService;
        this.securityContextRepository = securityContextRepository;
        this.expirationFilter = expirationFilter;
    }

    @GetMapping("/csrf")
    CsrfResponse csrf(CsrfToken csrfToken) {
        return new CsrfResponse(csrfToken.getHeaderName(), csrfToken.getParameterName(), csrfToken.getToken());
    }

    @GetMapping("/session")
    SessionResponse session(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof AdministratorPrincipal principal)) {
            return SessionResponse.anonymous();
        }
        return SessionResponse.authenticated(principal);
    }

    @PostMapping("/login")
    ResponseEntity<SessionResponse> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request,
            HttpServletResponse response) {
        AdministratorPrincipal principal = authenticationService.authenticate(
                loginRequest.email(), loginRequest.password(), request.getRemoteAddr());
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                principal, null, principal.authorities());
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        HttpSession session = request.getSession(true);
        request.changeSessionId();
        Instant absoluteExpiration = expirationFilter.newExpiration();
        session.setAttribute(AbsoluteSessionExpirationFilter.ABSOLUTE_EXPIRATION_ATTRIBUTE, absoluteExpiration);
        securityContextRepository.saveContext(securityContext, request, response);
        return ResponseEntity.ok(SessionResponse.authenticated(principal));
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {
    }

    public record CsrfResponse(String headerName, String parameterName, String token) {
    }

    public record SessionResponse(
            boolean authenticated,
            UUID userId,
            String email,
            String displayName,
            String role) {

        static SessionResponse anonymous() {
            return new SessionResponse(false, null, null, null, null);
        }

        static SessionResponse authenticated(AdministratorPrincipal principal) {
            return new SessionResponse(
                    true, principal.id(), principal.email(), principal.displayName(), principal.role());
        }
    }
}
