package status.zap.Application.subscription.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import status.zap.Application.subscription.dto.MercadoPagoWebhookNotificationDTO;
import status.zap.Application.subscription.service.SubscriptionService;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/webhooks/mercado-pago")
@RequiredArgsConstructor
public class MercadoPagoWebhookController {

    private final SubscriptionService subscriptionService;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<Map<String, String>> receive(
            @RequestBody(required = false) String rawPayload,
            HttpServletRequest request
    ) {
        MercadoPagoWebhookNotificationDTO payload = parsePayload(rawPayload);
        subscriptionService.processWebhook(payload, rawPayload, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("status", "received"));
    }

    private MercadoPagoWebhookNotificationDTO parsePayload(String rawPayload) {
        if (rawPayload == null || rawPayload.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(rawPayload, MercadoPagoWebhookNotificationDTO.class);
        } catch (Exception ex) {
            log.warn("Falha ao converter webhook Mercado Pago em DTO. O payload bruto será preservado.", ex);
            return null;
        }
    }
}
