package status.zap.Application.Service.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import status.zap.Application.Auth.dto.AuthenticatedUser;
import status.zap.Application.Service.dto.*;
import status.zap.Application.Service.model.ObjetoService;
import status.zap.Application.Service.service.ServiceService;
import status.zap.Application.commons.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceService serviceService;

    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    /** GET /services — lista todas as OS do usuário autenticado */
    @GetMapping
    public ResponseEntity<List<ServiceResponseDTO>> list(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(serviceService.listByUser(user.id()));
    }

    /** GET /services/:id */
    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(serviceService.getById(id, user.id()));
    }

    /** GET /public/:token */
    @GetMapping("/public/{token}")
    public ResponseEntity<ServiceResponseDTO> findByPublicToken(
            @PathVariable("token") String publicToken
    ) {
        return ResponseEntity.ok(
                serviceService.findByPublicToken(publicToken)
        );
    }

    /** GET /public/:slug/:short — resolve slug → userId → OS pelo short token */
    @GetMapping("/public/{id}/{short}")
    public ResponseEntity<ServiceResponseDTO> findBySlugAndShort(@PathVariable UUID id, @PathVariable String short_) {
        return ResponseEntity.ok(serviceService.findBySlugAndShort(id, short_));
    }

    /** POST /services */
    @PostMapping
    public ResponseEntity<ServiceResponseDTO> create(
            @Valid @RequestBody CreateServiceRequestDTO dto,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(serviceService.create(dto, user.id()));
    }

    /** PATCH /services/:id — edição de campos */
    @PatchMapping("/{id}")
    public ResponseEntity<ServiceResponseDTO> update(
            @PathVariable UUID id,
            @RequestBody UpdateServiceRequestDTO dto,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(serviceService.update(id, dto, user.id()));
    }

    /** PATCH /services/:id/status — troca de status */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ServiceResponseDTO> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequestDTO dto,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(serviceService.updateStatus(id, dto, user.id()));
    }

    /** DELETE /services/:id */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        serviceService.delete(id, user.id());
        return ResponseEntity.noContent().build(); // 204
    }
}
