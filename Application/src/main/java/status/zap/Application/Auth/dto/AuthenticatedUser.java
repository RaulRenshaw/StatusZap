package status.zap.Application.Auth.dto;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import status.zap.Application.Auth.model.UsersEntity;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Principal injetado via @AuthenticationPrincipal nos controllers.
 *
 * Encapsula UUID do usuário diretamente para evitar uma query
 * extra por email a cada request autenticado.
 *
 * Configurar no JwtAuthenticationFilter:
 *   UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
 *       new AuthenticatedUser(entity), null, authorities);
 */
public record AuthenticatedUser(
        UUID id,
        String email,
        String role
) implements UserDetails {

    public static AuthenticatedUser from(UsersEntity entity) {
        return new AuthenticatedUser(
                entity.getId(),
                entity.getEmail(),
                entity.getRoles().name()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(() -> "ROLE_" + role);
    }

    @Override public String getPassword()  { return null; }
    @Override public String getUsername()  { return email; }
    @Override public boolean isAccountNonExpired()    { return true; }
    @Override public boolean isAccountNonLocked()     { return true; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled()              { return true; }
}
