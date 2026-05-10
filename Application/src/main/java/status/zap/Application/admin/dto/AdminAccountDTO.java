package status.zap.Application.admin.dto;

import java.util.UUID;

public record AdminAccountDTO(
        UUID id,
        String email,
        String shopName,
        String role,
        long orderCount
) {}
