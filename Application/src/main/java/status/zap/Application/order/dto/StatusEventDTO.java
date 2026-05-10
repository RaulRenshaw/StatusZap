package status.zap.Application.order.dto;

import status.zap.Application.order.model.enums.OrderStatus;

import java.time.Instant;

public record StatusEventDTO(
        OrderStatus status,
        Instant at,
        String note
) {}
