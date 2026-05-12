package status.zap.Application.subscription.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.math.BigDecimal;

@Getter
@Setter
@ConfigurationProperties(prefix = "mercado-pago")
public class MercadoPagoProperties {

    private boolean enabled = false;
    private boolean sandbox = true;
    private String accessToken;
    private String publicKey;
    private String webhookSecret;

    @NotBlank
    private String baseUrl = "https://api.mercadopago.com";

    @NotBlank
    private String planCode = "premium_monthly";

    @NotBlank
    private String planReason = "Assinatura Premium Mensal";

    private BigDecimal amount = new BigDecimal("29.00");

    @NotBlank
    private String currency = "BRL";

    @NotBlank
    private String backUrl = "http://localhost:5173/billing/mercado-pago";

    private String notificationUrl;
}
