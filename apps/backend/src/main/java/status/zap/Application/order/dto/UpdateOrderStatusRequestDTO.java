package status.zap.Application.order.dto;

import jakarta.validation.constraints.NotNull;
import status.zap.Application.order.model.enums.OrderStatus;

/**
 * PATCH /api/orders/:id/status
 */
public record UpdateOrderStatusRequestDTO(
        @NotNull OrderStatus status,
        String note
) {}
