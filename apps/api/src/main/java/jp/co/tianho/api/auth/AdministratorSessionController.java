package jp.co.tianho.api.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import io.swagger.v3.oas.annotations.Parameter;
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
    private final MfaService mfaService;

    public AdministratorSessionController(
            AdministratorAuthenticationService authenticationService,
            SecurityContextRepository securityContextRepository,
            AbsoluteSessionExpirationFilter expirationFilter,
            MfaService mfaService) {
        this.authenticationService = authenticationService;
        this.securityContextRepository = securityContextRepository;
        this.expirationFilter = expirationFilter;
        this.mfaService = mfaService;
    }

    @GetMapping("/csrf")
    CsrfResponse csrf(@Parameter(hidden = true) CsrfToken csrfToken) {
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
    ResponseEntity<MfaService.ChallengeResponse> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request,
            HttpServletResponse response) {
        AdministratorAuthenticationService.PasswordAuthenticationResult authenticationResult =
                authenticationService.authenticate(
                loginRequest.email(), loginRequest.password(), request.getRemoteAddr());
        return ResponseEntity.accepted().body(mfaService.begin(
                authenticationResult.principal(), authenticationResult.mfaEnabled()));
    }

    @PostMapping("/mfa/bind")
    MfaService.BindingResponse bind(@Valid @RequestBody ChallengeRequest request) {
        return mfaService.binding(request.challengeId());
    }

    @PostMapping("/mfa/verify")
    VerificationResponse verify(
            @Valid @RequestBody VerifyRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        MfaService.VerificationResult result = mfaService.verify(
                request.challengeId(), request.code(), servletRequest.getRemoteAddr());
        establishSession(result.principal(), servletRequest, servletResponse);
        return new VerificationResponse(SessionResponse.authenticated(result.principal()), result.recoveryCodes());
    }

    @PostMapping("/mfa/recovery")
    VerificationResponse recover(
            @Valid @RequestBody RecoveryRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse servletResponse) {
        MfaService.VerificationResult result = mfaService.recover(
                request.challengeId(), request.recoveryCode(), servletRequest.getRemoteAddr());
        establishSession(result.principal(), servletRequest, servletResponse);
        return new VerificationResponse(SessionResponse.authenticated(result.principal()), result.recoveryCodes());
    }

    private void establishSession(
            AdministratorPrincipal principal,
            HttpServletRequest request,
            HttpServletResponse response) {
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
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {
    }

    public record ChallengeRequest(@NotNull UUID challengeId) {
    }

    public record VerifyRequest(
            @NotNull UUID challengeId,
            @NotBlank @Pattern(regexp = "\\d{6}") String code) {
    }

    public record RecoveryRequest(
            @NotNull UUID challengeId,
            @NotBlank @Pattern(regexp = "[A-Za-z2-7]{4}-[A-Za-z2-7]{4}-[A-Za-z2-7]{4}")
            String recoveryCode) {
    }

    public record CsrfResponse(String headerName, String parameterName, String token) {
    }

    public record VerificationResponse(SessionResponse session, java.util.List<String> recoveryCodes) {
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
