package status.zap.Application.order.dto;

import status.zap.Application.order.model.enums.OrderStatus;

import java.time.Instant;
import java.util.UUID;

/** Payload enviado via SSE quando status muda */
public record OrderUpdatedEventDTO(
        UUID orderId,
        OrderStatus status,
        Instant updatedAt
) {}
