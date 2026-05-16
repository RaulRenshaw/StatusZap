package status.zap.Application.subscription.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record SubscriptionResponseDTO(
        UUID id,
        String planCode,
        String provider,
        String accountPlan,
        String status,
        BigDecimal amount,
        String currency,
        String externalReference,
        String mercadoPagoSubscriptionId,
        String checkoutUrl,
        Instant currentPeriodStart,
        Instant currentPeriodEnd,
        Instant nextBillingAt,
        Instant lastPaymentAt,
        String lastPaymentStatus,
        Instant canceledAt,
        Instant createdAt,
        Instant updatedAt
) {}
