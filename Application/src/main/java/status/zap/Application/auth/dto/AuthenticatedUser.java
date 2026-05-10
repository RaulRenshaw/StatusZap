package status.zap.Application.auth.dto;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import status.zap.Application.auth.model.enums.UserRole;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Principal injetado via @AuthenticationPrincipal.
 * Evita queries extras por request — todos os dados vêm do JWT.
 */
public record AuthenticatedUser(
        UUID id,
        String email,
        UserRole role
) implements UserDetails {

    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(() -> "ROLE_" + role.name());
    }
    @Override public String getPassword()  { return null; }
    @Override public String getUsername()  { return email; }
}
