package status.zap.Application.Admin.dto;

import java.util.UUID;

/** Item de GET /admin/accounts */
public record AdminAccountDTO(
        UUID id,
        String email,
        String shopName,
        String role,
        long totalServices
) {}
