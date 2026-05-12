package status.zap.Application.order.dto;

import status.zap.Application.order.model.enums.OrderStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponseDTO(
        UUID id,
        UUID userId,
        String publicToken,
        String customerName,
        String customerPhone,
        String device,
        String observations,
        OrderStatus status,
        Instant createdAt,
        Instant updatedAt,
        Instant estimatedReadyAt,
        Integer priceInCents,
        List<StatusEventDTO> history
) {}
