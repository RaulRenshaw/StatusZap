package status.zap.Application.subscription.dto;

import java.math.BigDecimal;

public record SubscriptionConfigResponseDTO(
        String publicKey,
        String planCode,
        BigDecimal amount,
        String currency
) {}
