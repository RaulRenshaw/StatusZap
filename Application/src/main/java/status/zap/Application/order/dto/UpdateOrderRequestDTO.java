package status.zap.Application.order.dto;

import java.time.Instant;

/**
 * PATCH /api/orders/:id — edição parcial. null = não alterar.
 */
public record UpdateOrderRequestDTO(
        String customerName,
        String customerPhone,
        String device,
        String observations,
        Instant estimatedReadyAt,
        Integer priceInCents
) {}
