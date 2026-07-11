package jp.co.tianho.api.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdministratorUserController {

    private final AdministratorUserService userService;

    public AdministratorUserController(AdministratorUserService userService) {
        this.userService = userService;
    }

    @GetMapping
    List<AdministratorUserService.UserResponse> users() {
        return userService.findUsers();
    }

    @PostMapping
    ResponseEntity<AdministratorUserService.UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {
        AdministratorUserService.UserResponse user = userService.createUser(
                request.email(), request.displayName(), request.password(), request.role(),
                principal(authentication), servletRequest.getRemoteAddr());
        return ResponseEntity.created(URI.create("/api/v1/admin/users/" + user.id())).body(user);
    }

    @PatchMapping("/{id}/role")
    AdministratorUserService.UserResponse changeRole(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeRoleRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {
        return userService.changeRole(
                id, request.role(), principal(authentication), servletRequest.getRemoteAddr());
    }

    @PatchMapping("/{id}/status")
    AdministratorUserService.UserResponse changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeStatusRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {
        return userService.changeStatus(
                id, request.active(), principal(authentication), servletRequest.getRemoteAddr());
    }

    private AdministratorPrincipal principal(Authentication authentication) {
        return (AdministratorPrincipal) authentication.getPrincipal();
    }

    public record CreateUserRequest(
            @NotBlank @Email String email,
            @NotBlank @Size(max = 160) String displayName,
            @NotBlank @Size(min = 16, max = 200) String password,
            @NotNull AdministratorRole role) {
    }

    public record ChangeRoleRequest(@NotNull AdministratorRole role) {
    }

    public record ChangeStatusRequest(boolean active) {
    }
}
