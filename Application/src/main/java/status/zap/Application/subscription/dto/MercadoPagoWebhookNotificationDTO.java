package status.zap.Application.subscription.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record MercadoPagoWebhookNotificationDTO(
        String id,
        String type,
        String action,
        WebhookData data
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record WebhookData(String id) {}
}
