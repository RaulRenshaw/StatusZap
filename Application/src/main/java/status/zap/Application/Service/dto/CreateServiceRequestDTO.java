package status.zap.Application.Service.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

/**
 * POST /services
 *
 * O campo "problem" existia só no frontend (localStorage).
 * No backend, problema/descrição é unificado em "observations".
 * O store.ts já concatena problem + observations antes de enviar.
 */
public record CreateServiceRequestDTO(
        @NotBlank String customerName,
        String customerPhone,
        @NotBlank String device,
        String observations,
        Instant estimatedReadAt
        //Integer price
) {}