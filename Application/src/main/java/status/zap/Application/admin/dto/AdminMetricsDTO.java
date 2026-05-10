package status.zap.Application.admin.dto;

public record AdminMetricsDTO(
        long totalAccounts,
        long totalOrders,
        long ordersLast30Days,
        long activeAccounts
) {}
