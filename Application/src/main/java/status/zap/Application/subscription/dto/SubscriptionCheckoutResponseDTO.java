package status.zap.Application.subscription.dto;

import java.util.UUID;

public record SubscriptionCheckoutResponseDTO(
        UUID subscriptionId,
        String externalReference,
        String mercadoPagoSubscriptionId,
        String checkoutUrl,
        String status,
        String accountPlan
) {}
