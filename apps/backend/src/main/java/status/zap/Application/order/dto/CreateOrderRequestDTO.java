package status.zap.Application.order.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

/**
 * POST /api/orders
 */
public record CreateOrderRequestDTO(
        @NotBlank String customerName,
        String customerPhone,
        @NotBlank String device,
        String observations,
        Instant estimatedReadyAt,
        Integer priceInCents
) {}
