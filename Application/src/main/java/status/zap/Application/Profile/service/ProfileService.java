package status.zap.Application.Profile.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import status.zap.Application.Auth.model.UsersEntity;
import status.zap.Application.Auth.repository.UsersRepository;
import status.zap.Application.Profile.dto.ProfileRequestDTO;
import status.zap.Application.Profile.dto.ProfileResponseDTO;
import status.zap.Application.Profile.model.ProfileEntity;
import status.zap.Application.Profile.repository.ProfileRepository;
import status.zap.Application.commons.exception.ConflictException;
import status.zap.Application.commons.exception.ResourceNotFoundException;
import status.zap.Application.commons.storage.StorageService;

import java.util.UUID;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UsersRepository usersRepository;
    private final StorageService storageService;

    public ProfileService(ProfileRepository profileRepository,
                          UsersRepository usersRepository,
                          StorageService storageService) {
        this.profileRepository = profileRepository;
        this.usersRepository = usersRepository;
        this.storageService = storageService;
    }

    /** GET /profile — retorna perfil do usuário autenticado */
    public ProfileResponseDTO getProfile(UUID userId) {
        ProfileEntity profile = findByUserIdOrThrow(userId);
        return toResponse(profile);
    }

    /** GET /public/profile/:slug — perfil público (sem auth) */
    public ProfileResponseDTO getPublicProfile(String slug) {
        ProfileEntity profile = profileRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado"));
        return toResponse(profile);
    }

    /** PUT /profile — cria ou atualiza perfil do usuário autenticado */
    @Transactional
    public ProfileResponseDTO saveProfile(UUID userId, ProfileRequestDTO dto) {
        // Valida slug único (ignora o próprio usuário)
        if (profileRepository.existsBySlugAndUserIdNot(dto.slug(), userId)) {
            throw new ConflictException("Slug já está em uso");
        }

        UsersEntity user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        ProfileEntity profile = profileRepository.findByUserId(userId)
                .orElse(ProfileEntity.builder().user(user).build());

        profile.setName(dto.name());
        profile.setSlug(dto.slug());
        profile.setPhone(dto.phone());
        profile.setAddress(dto.address());
        profile.setGreeting(dto.greeting());
        if (dto.logoUrl() != null) {
            profile.setLogoUrl(dto.logoUrl());
        }

        return toResponse(profileRepository.save(profile));
    }

    /** POST /profile/logo — faz upload da logo e retorna a URL */
    @Transactional
    public String uploadLogo(UUID userId, MultipartFile file) {
        String logoUrl = storageService.store(file, "logos");

        // Persiste URL no perfil (se o perfil já existir)
        profileRepository.findByUserId(userId).ifPresent(profile -> {
            // Remove logo antiga para não acumular arquivos órfãos
            if (profile.getLogoUrl() != null) {
                storageService.delete(profile.getLogoUrl());
            }
            profile.setLogoUrl(logoUrl);
            profileRepository.save(profile);
        });

        return logoUrl;
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public ProfileEntity findByUserIdOrThrow(UUID userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado"));
    }

    public ProfileResponseDTO toResponse(ProfileEntity p) {
        return new ProfileResponseDTO(
                p.getName(),
                p.getSlug(),
                p.getPhone(),
                p.getAddress(),
                p.getLogoUrl(),
                p.getGreeting()
        );
    }
}