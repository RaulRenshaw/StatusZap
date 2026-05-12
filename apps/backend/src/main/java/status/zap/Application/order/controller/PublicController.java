package status.zap.Application.order.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import status.zap.Application.commons.exception.ResourceNotFoundException;
import status.zap.Application.order.dto.OrderResponseDTO;
import status.zap.Application.order.dto.PublicTrackingResponseDTO;
import status.zap.Application.order.service.OrderService;
import status.zap.Application.order.sse.SseService;
import status.zap.Application.profile.dto.ProfileResponseDTO;
import status.zap.Application.profile.model.ProfileEntity;
import status.zap.Application.profile.repository.ProfileRepository;
import status.zap.Application.profile.service.ProfileService;

/**
 * Endpoints públicos — sem autenticação.
 * Liberados no SecurityConfig via /api/public/**.
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final OrderService orderService;
    private final ProfileRepository profileRepository;
    private final ProfileService profileService;
    private final SseService sseService;

    /**
     * GET /api/public/:token
     * Rota principal — cliente acessa /r/:token.
     */
    @GetMapping("/{token}")
    public ResponseEntity<PublicTrackingResponseDTO> trackByToken(
            @PathVariable String token) {

        OrderResponseDTO order = orderService.findByPublicToken(token);
        ProfileResponseDTO profile = resolveProfile(order.userId());

        return ResponseEntity.ok(new PublicTrackingResponseDTO(order, profile));
    }

    /**
     * GET /api/public/:slug/:shortToken
     * Link amigável — cliente acessa /<slug>/<shortToken>.
     */
    @GetMapping("/{slug}/{shortToken}")
    public ResponseEntity<PublicTrackingResponseDTO> trackBySlugAndShortToken(
            @PathVariable String slug,
            @PathVariable String shortToken) {

        ProfileEntity profileEntity = profileRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado"));

        OrderResponseDTO order = orderService.findByUserIdAndShortToken(
                profileEntity.getUser().getId(), shortToken);

        ProfileResponseDTO profile = profileService.toResponse(profileEntity);

        return ResponseEntity.ok(new PublicTrackingResponseDTO(order, profile));
    }

    /**
     * GET /api/public/stream/:token
     * SSE — cliente se inscreve para receber updates em tempo real.
     */
    @GetMapping(value = "/stream/{token}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable String token) {
        return sseService.subscribe(token);
    }

    // ─────────────────────────────────────────────────────────────────────────

    private ProfileResponseDTO resolveProfile(java.util.UUID userId) {
        return profileRepository.findByUserId(userId)
                .map(profileService::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil da loja não encontrado"));
    }
}
