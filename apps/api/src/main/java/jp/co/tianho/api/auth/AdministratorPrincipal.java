package jp.co.tianho.api.auth;

import java.io.Serial;
import java.io.Serializable;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public record AdministratorPrincipal(
        UUID id,
        String email,
        String displayName,
        String role) implements Principal, Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    public List<GrantedAuthority> authorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getName() {
        return email;
    }
}
