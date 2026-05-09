package status.zap.Application.Admin.dto;

/** GET /admin/metrics */
public record AdminMetricsDTO(
        long totalAccounts,
        long totalServices,
        long servicesLast30Days,
        long activeAccounts   // contas com pelo menos 1 OS
) {}
