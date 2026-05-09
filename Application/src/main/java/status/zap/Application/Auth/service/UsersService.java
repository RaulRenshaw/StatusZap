package status.zap.Application.Auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import status.zap.Application.Auth.dto.*;
import status.zap.Application.Auth.model.enums.Roles;
import status.zap.Application.Auth.model.UsersEntity;
import status.zap.Application.Auth.repository.UsersRepository;
import status.zap.Application.Auth.config.JwtUtil;
import status.zap.Application.Profile.model.ProfileEntity;
import status.zap.Application.Profile.repository.ProfileRepository;
import status.zap.Application.commons.exception.ConflictException;

import java.time.Instant;
import java.util.List;

@Service
public class UsersService {

    private final UsersRepository usersRepository;
    private final AccountLockService accountLockService;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${jwt.expiration-ms}")
    private Long EXPIRATION_TIME;

    public UsersService(UsersRepository usersRepository, AccountLockService accountLockService, ProfileRepository profileRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.usersRepository = usersRepository;
        this.accountLockService = accountLockService;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponseDTO register(RegisterRequestDTO dto) {
        if (usersRepository.existsByEmail(dto.getEmail())) {
            throw new ConflictException("E-mail já cadastrado");
        }

        String passwordHash = passwordEncoder.encode(dto.getPassword());
        UsersEntity entity = UsersEntity.builder()
                .email(dto.getEmail())
                .password(passwordHash)
                .roles(Roles.USER)
                .build();

        if (dto.getShopName() != null) {
            entity.setShopName(dto.getShopName());
        }

        usersRepository.save(entity);
        profileRepository.save(createDefaultProfile(entity));

        return buildAuthResponse(entity);
    }

    @Transactional(noRollbackFor = BadCredentialsException.class)
    public AuthResponseDTO login(LoginRequestDTO dto) {

        UsersEntity user = usersRepository.findByEmail(dto.getEmail())
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid credentials"));

        if (accountLockService.isLocked(user)) {
            throw new LockedException("Account locked. Try again later.");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            accountLockService.registerFailure(user);
            usersRepository.save(user);

            throw new BadCredentialsException("Invalid credentials");
        }

        accountLockService.reset(user);
        usersRepository.save(user);

        return buildAuthResponse(user);
    }

    public void logout(String token) {
        // TODO: tokenBlacklistService.revoke(token);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private AuthResponseDTO buildAuthResponse(UsersEntity entity) {
        String token = jwtUtil.generateToken(entity);
        Instant expiresAt = Instant.now().plusMillis(EXPIRATION_TIME);

        UserResponse userResponse = new UserResponse(
                entity.getId(),
                entity.getEmail(),
                entity.getShopName(),
                List.of(entity.getRoles().name())
        );

        SessionResponse sessionResponse = new SessionResponse(token, expiresAt);
        return new AuthResponseDTO(userResponse, sessionResponse);
    }

    private String generateUniqueSlug(String base) {
        String slug = slugify(base);
        String candidate = slug;
        int suffix = 1;

        while (profileRepository.existsBySlug(candidate)) {
            candidate = slug + "-" + suffix;
            suffix++;
        }

        return candidate;
    }

    private String slugify(String value) {
        if (value == null || value.isBlank()) {
            return "perfil";
        }

        String normalized = java.text.Normalizer.normalize(
                value,
                java.text.Normalizer.Form.NFD
        );

        return normalized
                .replaceAll("\\p{M}", "")       // remove acento
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")  // espaço -> -
                .replaceAll("^-|-$", "");       // trim -
    }


    private ProfileEntity createDefaultProfile(UsersEntity user) {
        String baseName =
                user.getShopName() != null && !user.getShopName().isBlank()
                        ? user.getShopName()
                        : user.getEmail().split("@")[0];

        return ProfileEntity.builder()
                .user(user)
                .name(baseName)
                .slug(generateUniqueSlug(baseName))
                .phone(null)
                .address(null)
                .logoUrl(null)
                .greeting("Olá! Acompanhe seu serviço por aqui.")
                .build();
    }

}