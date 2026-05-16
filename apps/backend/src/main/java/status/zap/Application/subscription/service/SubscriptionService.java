package status.zap.Application.subscription.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import status.zap.Application.auth.model.UserEntity;
import status.zap.Application.auth.model.enums.AccountPlan;
import status.zap.Application.auth.repository.UserRepository;
import status.zap.Application.commons.exception.ForbiddenException;
import status.zap.Application.commons.exception.ResourceNotFoundException;
import status.zap.Application.subscription.config.MercadoPagoProperties;
import status.zap.Application.subscription.dto.MercadoPagoWebhookNotificationDTO;
import status.zap.Application.subscription.dto.SubscriptionCheckoutResponseDTO;
import status.zap.Application.subscription.dto.SubscriptionConfigResponseDTO;
import status.zap.Application.subscription.dto.SubscriptionResponseDTO;
import status.zap.Application.subscription.model.SubscriptionEntity;
import status.zap.Application.subscription.model.SubscriptionEventEntity;
import status.zap.Application.subscription.model.enums.SubscriptionStatus;
import status.zap.Application.subscription.repository.SubscriptionEventRepository;
import status.zap.Application.subscription.repository.SubscriptionRepository;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private static final List<SubscriptionStatus> REUSABLE_STATUSES = List.of(
            SubscriptionStatus.PENDING,
            SubscriptionStatus.AUTHORIZED,
            SubscriptionStatus.PAST_DUE
    );

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionEventRepository subscriptionEventRepository;
    private final UserRepository userRepository;
    private final MercadoPagoClient mercadoPagoClient;
    private final MercadoPagoProperties properties;
    private final ObjectMapper objectMapper;

    public SubscriptionConfigResponseDTO getConfig() {
        return new SubscriptionConfigResponseDTO(
                properties.getPublicKey(),
                properties.getPlanCode(),
                properties.getAmount(),
                properties.getCurrency()
        );
    }

    @Transactional(readOnly = true)
    public SubscriptionResponseDTO getCurrentSubscription(UUID userId) {
        SubscriptionEntity subscription = subscriptionRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Assinatura não encontrada"));
        return toResponse(subscription);
    }

    @Transactional
    public SubscriptionCheckoutResponseDTO startCheckout(UUID userId) {
        ensureIntegrationEnabled();

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Optional<SubscriptionEntity> current = subscriptionRepository.findTopByUserIdOrderByCreatedAtDesc(userId);
        if (current.isPresent() && REUSABLE_STATUSES.contains(current.get().getStatus())) {
            return toCheckoutResponse(current.get(), user.getAccountPlan());
        }
        String externalReference = buildExternalReference(user.getId());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("payer_email", user.getEmail());
        payload.put("external_reference", externalReference);
        payload.put("back_url", properties.getBackUrl());
        payload.put("reason", properties.getPlanReason());
        payload.put("auto_recurring", Map.of(
                "frequency", 1,
                "frequency_type", "months",
                "transaction_amount", properties.getAmount(),
                "currency_id", properties.getCurrency()
        ));
        if (StringUtils.hasText(properties.getNotificationUrl())) {
            payload.put("notification_url", properties.getNotificationUrl());
        }

        JsonNode response = mercadoPagoClient.createSubscription(payload);

        SubscriptionEntity subscription = SubscriptionEntity.builder()
                .user(user)
                .externalReference(externalReference)
                .planCode(properties.getPlanCode())
                .provider("mercado_pago")
                .mercadoPagoSubscriptionId(response.path("id").asText())
                .status(mapSubscriptionStatus(response.path("status").asText()))
                .amount(properties.getAmount())
                .currency(properties.getCurrency())
                .checkoutUrl(response.path("init_point").asText(null))
                .nextBillingAt(parseInstant(response.path("next_payment_date").asText(null)))
                .rawMetadata(writeJson(response))
                .build();

        subscriptionRepository.save(subscription);
        applyUserPlan(user, subscription.getStatus());

        return toCheckoutResponse(subscription, user.getAccountPlan());
    }

    @Transactional
    public SubscriptionResponseDTO cancelCurrentSubscription(UUID userId) {
        ensureIntegrationEnabled();

        SubscriptionEntity subscription = subscriptionRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Assinatura não encontrada"));

        if (!StringUtils.hasText(subscription.getMercadoPagoSubscriptionId())) {
            throw new ForbiddenException("Assinatura ainda não foi criada no Mercado Pago.");
        }

        JsonNode response = mercadoPagoClient.cancelSubscription(subscription.getMercadoPagoSubscriptionId());
        syncSubscriptionResponse(subscription, response);
        applyUserPlan(subscription.getUser(), subscription.getStatus());
        return toResponse(subscription);
    }

    @Transactional
    public void processWebhook(MercadoPagoWebhookNotificationDTO body, String rawPayload, HttpServletRequest request) {
        if (!isSignatureValid(request)) {
            throw new ForbiddenException("Webhook do Mercado Pago com assinatura inválida.");
        }

        String topic = normalizeTopic(body, request);
        String resourceId = extractResourceId(body, request);
        String providerEventId = buildProviderEventId(body, topic, resourceId);

        if (subscriptionEventRepository.existsByProviderEventIdAndProviderTopic(providerEventId, topic)) {
            return;
        }

        SubscriptionEventEntity event = subscriptionEventRepository.save(SubscriptionEventEntity.builder()
                .providerEventId(providerEventId)
                .providerTopic(topic)
                .payload(rawPayload)
                .build());

        switch (topic) {
            case "subscription_preapproval" -> processSubscriptionEvent(resourceId);
            case "subscription_authorized_payment" -> processAuthorizedPaymentEvent(resourceId);
            case "payment" -> processPaymentEvent(resourceId);
            default -> log.info("Webhook Mercado Pago ignorado. topic={}", topic);
        }

        event.setProcessedAt(Instant.now());
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void reconcileOpenSubscriptions() {
        if (!properties.isEnabled() || !StringUtils.hasText(properties.getAccessToken())) {
            return;
        }

        for (SubscriptionEntity subscription : subscriptionRepository.findByStatusIn(REUSABLE_STATUSES)) {
            if (!StringUtils.hasText(subscription.getMercadoPagoSubscriptionId())) {
                continue;
            }

            try {
                JsonNode response = mercadoPagoClient.getSubscription(subscription.getMercadoPagoSubscriptionId());
                syncSubscriptionResponse(subscription, response);
                applyUserPlan(subscription.getUser(), subscription.getStatus());
            } catch (Exception ex) {
                log.warn("Falha ao reconciliar assinatura {}", subscription.getId(), ex);
            }
        }
    }

    private void processSubscriptionEvent(String resourceId) {
        if (!StringUtils.hasText(resourceId)) {
            return;
        }

        JsonNode response = mercadoPagoClient.getSubscription(resourceId);
        SubscriptionEntity subscription = findOrCreateSubscription(response);
        syncSubscriptionResponse(subscription, response);
        applyUserPlan(subscription.getUser(), subscription.getStatus());
    }

    private void processAuthorizedPaymentEvent(String resourceId) {
        if (!StringUtils.hasText(resourceId)) {
            return;
        }

        JsonNode payment = mercadoPagoClient.getAuthorizedPayment(resourceId);
        String preapprovalId = payment.path("preapproval_id").asText(null);
        if (!StringUtils.hasText(preapprovalId)) {
            return;
        }

        SubscriptionEntity subscription = subscriptionRepository.findByMercadoPagoSubscriptionId(preapprovalId)
                .orElseThrow(() -> new ResourceNotFoundException("Assinatura não encontrada para o webhook recebido"));

        subscription.setLastPaymentStatus(firstNonBlank(
                payment.path("status").asText(null),
                payment.path("payment").path("status").asText(null)
        ));
        subscription.setLastPaymentAt(firstInstant(
                parseInstant(payment.path("date_created").asText(null)),
                parseInstant(payment.path("last_modified").asText(null))
        ));
        subscription.setRawMetadata(writeJson(payment));
    }

    private void processPaymentEvent(String resourceId) {
        if (!StringUtils.hasText(resourceId)) {
            return;
        }

        JsonNode payment = mercadoPagoClient.getPayment(resourceId);
        String externalReference = payment.path("external_reference").asText(null);
        if (!StringUtils.hasText(externalReference)) {
            return;
        }

        subscriptionRepository.findByExternalReference(externalReference).ifPresent(subscription -> {
            subscription.setLastPaymentStatus(payment.path("status").asText(null));
            subscription.setLastPaymentAt(parseInstant(payment.path("date_approved").asText(null)));
            subscription.setRawMetadata(writeJson(payment));
        });
    }

    private SubscriptionEntity findOrCreateSubscription(JsonNode response) {
        String subscriptionId = response.path("id").asText();
        return subscriptionRepository.findByMercadoPagoSubscriptionId(subscriptionId)
                .orElseGet(() -> {
                    String externalReference = response.path("external_reference").asText(null);
                    UserEntity user = findUserByExternalReference(externalReference);
                    return subscriptionRepository.save(SubscriptionEntity.builder()
                            .user(user)
                            .externalReference(externalReference)
                            .planCode(null)
                            .provider("mercado_pago")
                            .mercadoPagoSubscriptionId(subscriptionId)
                            .status(SubscriptionStatus.UNKNOWN)
                            .amount(properties.getAmount())
                            .currency(properties.getCurrency())
                            .build());
                });
    }

    private UserEntity findUserByExternalReference(String externalReference) {
        if (!StringUtils.hasText(externalReference) || !externalReference.startsWith("premium:")) {
            throw new ResourceNotFoundException("Não foi possível relacionar a assinatura ao usuário.");
        }

        String[] parts = externalReference.split(":");
        if (parts.length < 2) {
            throw new ResourceNotFoundException("External reference inválido.");
        }

        UUID userId = UUID.fromString(parts[1]);
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado para a assinatura."));
    }

    private void syncSubscriptionResponse(SubscriptionEntity subscription, JsonNode response) {
        subscription.setMercadoPagoSubscriptionId(response.path("id").asText(subscription.getMercadoPagoSubscriptionId()));
        subscription.setStatus(mapSubscriptionStatus(response.path("status").asText()));
        subscription.setCheckoutUrl(response.path("init_point").asText(subscription.getCheckoutUrl()));
        subscription.setNextBillingAt(parseInstant(response.path("next_payment_date").asText(null)));
        subscription.setCurrentPeriodStart(parseInstant(response.path("auto_recurring").path("start_date").asText(null)));
        subscription.setCurrentPeriodEnd(parseInstant(response.path("auto_recurring").path("end_date").asText(null)));
        subscription.setAmount(parseBigDecimal(response.path("auto_recurring").path("transaction_amount").asText(null), properties.getAmount()));
        subscription.setCurrency(firstNonBlank(
                response.path("auto_recurring").path("currency_id").asText(null),
                subscription.getCurrency(),
                properties.getCurrency()
        ));
        subscription.setCanceledAt(subscription.getStatus() == SubscriptionStatus.CANCELED ? Instant.now() : null);
        subscription.setRawMetadata(writeJson(response));
    }

    private void applyUserPlan(UserEntity user, SubscriptionStatus status) {
        user.setAccountPlan(status == SubscriptionStatus.AUTHORIZED ? AccountPlan.PREMIUM : AccountPlan.FREE);
    }

    private SubscriptionCheckoutResponseDTO toCheckoutResponse(SubscriptionEntity subscription, AccountPlan plan) {
        return new SubscriptionCheckoutResponseDTO(
                subscription.getId(),
                subscription.getExternalReference(),
                subscription.getMercadoPagoSubscriptionId(),
                subscription.getCheckoutUrl(),
                subscription.getStatus().name().toLowerCase(),
                plan.name().toLowerCase()
        );
    }

    private SubscriptionResponseDTO toResponse(SubscriptionEntity subscription) {
        return new SubscriptionResponseDTO(
                subscription.getId(),
                subscription.getPlanCode(),
                subscription.getProvider(),
                subscription.getUser().getAccountPlan().name().toLowerCase(),
                subscription.getStatus().name().toLowerCase(),
                subscription.getAmount(),
                subscription.getCurrency(),
                subscription.getExternalReference(),
                subscription.getMercadoPagoSubscriptionId(),
                subscription.getCheckoutUrl(),
                subscription.getCurrentPeriodStart(),
                subscription.getCurrentPeriodEnd(),
                subscription.getNextBillingAt(),
                subscription.getLastPaymentAt(),
                subscription.getLastPaymentStatus(),
                subscription.getCanceledAt(),
                subscription.getCreatedAt(),
                subscription.getUpdatedAt()
        );
    }

    private String buildExternalReference(UUID userId) {
        return "premium:" + userId + ":" + Instant.now().toEpochMilli();
    }

    private SubscriptionStatus mapSubscriptionStatus(String status) {
        if (!StringUtils.hasText(status)) {
            return SubscriptionStatus.UNKNOWN;
        }

        return switch (status.toLowerCase(Locale.ROOT)) {
            case "authorized", "active" -> SubscriptionStatus.AUTHORIZED;
            case "pending" -> SubscriptionStatus.PENDING;
            case "paused" -> SubscriptionStatus.PAUSED;
            case "cancelled", "canceled" -> SubscriptionStatus.CANCELED;
            case "past_due" -> SubscriptionStatus.PAST_DUE;
            default -> SubscriptionStatus.UNKNOWN;
        };
    }

    private boolean isSignatureValid(HttpServletRequest request) {
        if (!StringUtils.hasText(properties.getWebhookSecret())) {
            return true;
        }

        String xSignature = request.getHeader("x-signature");
        String requestId = request.getHeader("x-request-id");
        if (!StringUtils.hasText(xSignature) || !StringUtils.hasText(requestId)) {
            return false;
        }

        Map<String, String> signatureParts = new LinkedHashMap<>();
        for (String part : xSignature.split(",")) {
            String[] keyValue = part.split("=", 2);
            if (keyValue.length == 2) {
                signatureParts.put(keyValue[0].trim(), keyValue[1].trim());
            }
        }

        String ts = signatureParts.get("ts");
        String v1 = signatureParts.get("v1");
        String dataId = Optional.ofNullable(request.getParameter("data.id"))
                .map(value -> value.toLowerCase(Locale.ROOT))
                .orElse("");

        String manifest = "id:" + dataId + ";request-id:" + requestId + ";ts:" + ts + ";";
        try {
            Mac hmacSha256 = Mac.getInstance("HmacSHA256");
            hmacSha256.init(new SecretKeySpec(properties.getWebhookSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String generated = HexFormat.of().formatHex(hmacSha256.doFinal(manifest.getBytes(StandardCharsets.UTF_8)));
            return MessageDigest.isEqual(generated.getBytes(StandardCharsets.UTF_8), v1.getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            log.warn("Falha ao validar assinatura do webhook Mercado Pago", ex);
            return false;
        }
    }

    private String normalizeTopic(MercadoPagoWebhookNotificationDTO body, HttpServletRequest request) {
        return firstNonBlank(
                request.getParameter("topic"),
                request.getParameter("type"),
                body != null ? body.type() : null,
                body != null ? body.action() : null
        );
    }

    private String extractResourceId(MercadoPagoWebhookNotificationDTO body, HttpServletRequest request) {
        return firstNonBlank(
                request.getParameter("data.id"),
                body != null && body.data() != null ? body.data().id() : null
        );
    }

    private String buildProviderEventId(MercadoPagoWebhookNotificationDTO body, String topic, String resourceId) {
        return firstNonBlank(body != null ? body.id() : null, "") + ":"
                + firstNonBlank(topic, "") + ":"
                + firstNonBlank(resourceId, "");
    }

    private Instant parseInstant(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return OffsetDateTime.parse(value).toInstant();
    }

    private Instant firstInstant(Instant... candidates) {
        for (Instant candidate : candidates) {
            if (candidate != null) {
                return candidate;
            }
        }
        return null;
    }

    private BigDecimal parseBigDecimal(String value, BigDecimal fallback) {
        if (!StringUtils.hasText(value)) {
            return fallback;
        }
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }

    private String writeJson(JsonNode node) {
        try {
            return objectMapper.writeValueAsString(node);
        } catch (JsonProcessingException ex) {
            return "{}";
        }
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }

    private void ensureIntegrationEnabled() {
        if (!properties.isEnabled() || !StringUtils.hasText(properties.getAccessToken())) {
            throw new ForbiddenException("Integração com Mercado Pago não está configurada.");
        }
    }
}
