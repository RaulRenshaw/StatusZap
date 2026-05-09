package status.zap.Application.Service.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import status.zap.Application.Profile.dto.ProfileResponseDTO;
import status.zap.Application.Profile.model.ProfileEntity;
import status.zap.Application.Profile.repository.ProfileRepository;
import status.zap.Application.Profile.service.ProfileService;
import status.zap.Application.Service.dto.PublicTrackingResponseDTO;
import status.zap.Application.Service.dto.ServiceResponseDTO;
import status.zap.Application.Service.service.ServiceService;
import status.zap.Application.Service.sse.SseService;
import status.zap.Application.commons.exception.ResourceNotFoundException;

/**
 * Endpoints públicos — sem autenticação.
 * Já liberados no SecurityConfig via .requestMatchers("/api/auth/**", "/api/public/**").permitAll()
 */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final ServiceService serviceService;
    private final ProfileRepository profileRepository;
    private final ProfileService profileService;

    private final SseService sseService;

    public PublicController(ServiceService serviceService, ProfileRepository profileRepository, ProfileService profileService, SseService sseService) {
        this.serviceService = serviceService;
        this.profileRepository = profileRepository;
        this.profileService = profileService;
        this.sseService = sseService;
    }

    /**
     * GET /public/:token
     * Rota principal — cliente acessa /r/:token.
     * Busca a OS pelo publicToken e retorna junto com o perfil da loja dona.
     */
    @GetMapping("/{token}")
    public ResponseEntity<PublicTrackingResponseDTO> trackByToken(
            @PathVariable("token") String publicToken) {

        ServiceResponseDTO service = serviceService.findByPublicToken(publicToken);
        ProfileResponseDTO profile = resolveProfile(service);

        return ResponseEntity.ok(new PublicTrackingResponseDTO(
                service,
                profile
        ));
    }

    /**
     * GET /public/:slug/:short
     * Link amigável — cliente acessa /<slug>/<short>.
     * Fluxo: slug → userId → OS pelo short (10 primeiros chars do publicToken).
     */
    @GetMapping("/{slug}/{short}")
    public ResponseEntity<PublicTrackingResponseDTO> trackBySlugAndShort(
            @PathVariable String slug,
            @PathVariable("short") String short_) {

        // 1. Resolve perfil pelo slug
        ProfileEntity profileEntity = profileRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado"));

        // 2. Usa o userId do perfil para buscar a OS
        ServiceResponseDTO service = serviceService.findBySlugAndShort(
                profileEntity.getUser().getId(), short_);

        // 3. Monta resposta
        ProfileResponseDTO profileDTO = profileService.toResponse(profileEntity);

        return ResponseEntity.ok(new PublicTrackingResponseDTO(
                service,
                profileDTO
        ));
    }


    @GetMapping(
            value = "/stream/{token}",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter stream(
            @PathVariable String token
    ) {
        return sseService.subscribe(token);
    }

    // -------------------------------------------------------------------------

    private ProfileResponseDTO resolveProfile(ServiceResponseDTO service) {
        return profileRepository
                .findByUserId(service.userId())
                .map(profileService::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil da loja não encontrado"));
    }
}
