package status.zap.Application.auth.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import status.zap.Application.auth.config.JwtUtil;
import status.zap.Application.auth.dto.*;
import status.zap.Application.auth.model.UserEntity;
import status.zap.Application.auth.model.enums.UserRole;
import status.zap.Application.auth.repository.UserRepository;
import status.zap.Application.commons.exception.ConflictException;
import status.zap.Application.profile.model.ProfileEntity;
import status.zap.Application.profile.repository.ProfileRepository;

import java.time.Instant;
import java.util.List;

/**
 * Serviço de autenticação.
 * Renomeado de UsersService → AuthService (nome expressa responsabilidade).
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final AccountLockService accountLockService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${jwt.expiration-ms}")
    private Long jwtExpirationMs;

    // ── Register ──────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ConflictException("E-mail já cadastrado");
        }

        UserEntity user = UserEntity.builder()
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .shopName(dto.getShopName())
                .role(UserRole.USER)
                .build();

        userRepository.save(user);

        // Cria perfil padrão — salvo no mesmo @Transactional
        profileRepository.save(buildDefaultProfile(user));

        return buildAuthResponse(user);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @Transactional(noRollbackFor = BadCredentialsException.class)
    public AuthResponseDTO login(LoginRequestDTO dto) {
        UserEntity user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));

        if (accountLockService.isLocked(user)) {
            throw new LockedException("Conta bloqueada. Tente novamente em 15 minutos.");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            accountLockService.registerFailure(user);
            userRepository.save(user);
            throw new BadCredentialsException("Credenciais inválidas");
        }

        accountLockService.reset(user);
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    public void logout(String token) {
        // TODO: tokenBlacklistService.revoke(token);
        // Implementar com Redis: SET revoked:<token> 1 EX <remaining-ttl>
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private AuthResponseDTO buildAuthResponse(UserEntity user) {
        String token      = jwtUtil.generateToken(user);
        Instant expiresAt = Instant.now().plusMillis(jwtExpirationMs);

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getShopName(),
                List.of(user.getRole().name())
        );

        return new AuthResponseDTO(userResponse, new SessionResponse(token, expiresAt));
    }

    private ProfileEntity buildDefaultProfile(UserEntity user) {
        String baseName = (user.getShopName() != null && !user.getShopName().isBlank())
                ? user.getShopName()
                : user.getEmail().split("@")[0];

        return ProfileEntity.builder()
                .user(user)
                .name(baseName)
                .slug(generateUniqueSlug(baseName))
                .greeting("Olá! Acompanhe seu serviço por aqui.")
                .build();
    }

    private String generateUniqueSlug(String base) {
        String slug      = slugify(base);
        String candidate = slug;
        int suffix       = 1;

        while (profileRepository.existsBySlug(candidate)) {
            candidate = slug + "-" + suffix++;
        }
        return candidate;
    }

    private String slugify(String value) {
        if (value == null || value.isBlank()) return "loja";
        String normalized = java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD);
        return normalized
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }
}
