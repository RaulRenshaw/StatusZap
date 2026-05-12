package status.zap.Application.auth.dto;

import java.util.List;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String shopName,
        String accountPlan,
        List<String> roles
) {}
