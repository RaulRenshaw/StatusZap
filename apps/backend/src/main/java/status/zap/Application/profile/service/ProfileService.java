package status.zap.Application.profile.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import status.zap.Application.auth.model.UserEntity;
import status.zap.Application.auth.repository.UserRepository;
import status.zap.Application.commons.exception.ConflictException;
import status.zap.Application.commons.exception.ResourceNotFoundException;
import status.zap.Application.commons.storage.StorageService;
import status.zap.Application.profile.dto.ProfileRequestDTO;
import status.zap.Application.profile.dto.ProfileResponseDTO;
import status.zap.Application.profile.model.ProfileEntity;
import status.zap.Application.profile.repository.ProfileRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    public ProfileResponseDTO getProfile(UUID userId) {
        return toResponse(findByUserIdOrThrow(userId));
    }

    public ProfileResponseDTO getPublicProfile(String slug) {
        return toResponse(
            profileRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado"))
        );
    }

    @Transactional
    public ProfileResponseDTO saveProfile(UUID userId, ProfileRequestDTO dto) {
        if (profileRepository.existsBySlugAndUserIdNot(dto.slug(), userId)) {
            throw new ConflictException("Slug já está em uso");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        ProfileEntity profile = profileRepository.findByUserId(userId)
                .orElse(ProfileEntity.builder().user(user).build());

        profile.setName(dto.name());
        profile.setSlug(dto.slug());
        profile.setPhone(dto.phone());
        profile.setAddress(dto.address());
        profile.setGreeting(dto.greeting());
        if (dto.logoUrl() != null) profile.setLogoUrl(dto.logoUrl());

        return toResponse(profileRepository.save(profile));
    }

    @Transactional
    public String uploadLogo(UUID userId, MultipartFile file) {
        String logoUrl = storageService.store(file, "logos");

        profileRepository.findByUserId(userId).ifPresent(profile -> {
            if (profile.getLogoUrl() != null) {
                storageService.delete(profile.getLogoUrl());
            }
            profile.setLogoUrl(logoUrl);
            profileRepository.save(profile);
        });

        return logoUrl;
    }

    public ProfileEntity findByUserIdOrThrow(UUID userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado"));
    }

    public ProfileResponseDTO toResponse(ProfileEntity p) {
        return new ProfileResponseDTO(
                p.getName(), p.getSlug(), p.getPhone(),
                p.getAddress(), p.getLogoUrl(), p.getGreeting()
        );
    }
}
