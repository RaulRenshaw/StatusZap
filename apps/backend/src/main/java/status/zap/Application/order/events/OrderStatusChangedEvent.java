package status.zap.Application.order.events;

import status.zap.Application.order.model.enums.OrderStatus;

import java.time.Instant;
import java.util.UUID;

public record OrderStatusChangedEvent(
        String publicToken,
        UUID orderId,
        OrderStatus status,
        Instant updatedAt
) {}
