package status.zap.Application.subscription.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import status.zap.Application.commons.exception.ExternalServiceException;
import status.zap.Application.subscription.config.MercadoPagoProperties;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class MercadoPagoClient {

    private final RestClient.Builder restClientBuilder;
    private final MercadoPagoProperties properties;
    private final ObjectMapper objectMapper;

    public JsonNode createPlan(Map<String, Object> payload) {
        return post("/preapproval_plan", payload, UUID.randomUUID().toString());
    }

    public JsonNode createSubscription(Map<String, Object> payload) {
        // Idempotency key determinística por external_reference — evita assinaturas duplicadas
        String externalRef = payload.getOrDefault("external_reference", UUID.randomUUID()).toString();
        String idempotencyKey = "subscription:" + externalRef;
        return post("/preapproval", payload, idempotencyKey);
    }

    public JsonNode getSubscription(String subscriptionId) {
        return get("/preapproval/" + subscriptionId);
    }

    public JsonNode cancelSubscription(String subscriptionId) {
        String idempotencyKey = "cancel:" + subscriptionId;
        return put("/preapproval/" + subscriptionId, Map.of("status", "cancelled"), idempotencyKey);
    }

    public JsonNode getAuthorizedPayment(String paymentId) {
        return get("/authorized_payments/" + paymentId);
    }

    public JsonNode getPayment(String paymentId) {
        return get("/v1/payments/" + paymentId);
    }

    private JsonNode post(
            String path,
            Map<String, Object> payload,
            String idempotencyKey
    ) {

        try {

            String response = restClient().post()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("X-Idempotency-Key", idempotencyKey)
                    .body(payload)
                    .retrieve()
                    .body(String.class);

            if (!StringUtils.hasText(response)) {
                throw new ExternalServiceException(
                        "Mercado Pago retornou resposta vazia."
                );
            }

            JsonNode json = objectMapper.readTree(response);

            if (json.has("error")) {

                throw new ExternalServiceException(
                        "Mercado Pago error: "
                                + json.path("error").asText()
                                + " - "
                                + json.path("message").asText()
                );
            }

            return json;

        } catch (RestClientResponseException ex) {

            throw buildExternalServiceException(ex);

        } catch (Exception ex) {

            throw new ExternalServiceException(
                    "Falha ao comunicar com o Mercado Pago: " + ex.getMessage(),
                    ex
            );
        }
    }

    private JsonNode put(String path, Map<String, Object> payload, String idempotencyKey) {
        try {
            String response = restClient().post()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("X-Idempotency-Key", idempotencyKey)
                    .body(payload)
                    .retrieve()
                    .body(String.class);

            if (!StringUtils.hasText(response)) {
                throw new ExternalServiceException(
                        "Mercado Pago retornou resposta vazia."
                );
            }
            JsonNode json = objectMapper.readTree(response);

            if (json.has("error")) {

                throw new ExternalServiceException(
                        "Mercado Pago error: "
                                + json.path("error").asText()
                                + " - "
                                + json.path("message").asText()
                );
            }

            return json;

        } catch (RestClientResponseException ex) {
            throw buildExternalServiceException(ex);

        } catch (Exception ex) {

            throw new ExternalServiceException(
                    "Falha ao comunicar com o Mercado Pago: " + ex.getMessage(),
                    ex
            );
        }
    }

    private JsonNode get(String path) {

        try {

            String response = restClient().get()
                    .uri(path)
                    .retrieve()
                    .body(String.class);

            if (!StringUtils.hasText(response)) {
                throw new ExternalServiceException(
                        "Mercado Pago retornou resposta vazia."
                );
            }
            JsonNode json = objectMapper.readTree(response);

            if (json.has("error")) {

                throw new ExternalServiceException(
                        "Mercado Pago error: "
                                + json.path("error").asText()
                                + " - "
                                + json.path("message").asText()
                );
            }

            return json;

        } catch (RestClientResponseException ex) {

            throw buildExternalServiceException(ex);

        } catch (Exception ex) {

            throw new ExternalServiceException(
                    "Falha ao comunicar com o Mercado Pago: " + ex.getMessage(),
                    ex
            );
        }
    }

    private RestClient restClient() {
        return restClientBuilder
                .baseUrl(properties.getBaseUrl())
                .defaultHeader(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + properties.getAccessToken()
                )
                .defaultHeader(
                        HttpHeaders.CONTENT_TYPE,
                        MediaType.APPLICATION_JSON_VALUE
                )
                .build();
    }

    private ExternalServiceException buildExternalServiceException(
            RestClientResponseException ex
    ) {

        String responseBody = ex.getResponseBodyAsString();

        log.error("""
        Mercado Pago API Error
        Status: {}
        Response: {}
        """,
                ex.getStatusCode(),
                responseBody
        );

        try {
            JsonNode body = objectMapper.readTree(responseBody);

            String error = body.path("error").asText("");
            String message = body.path("message").asText("");
            String cause = body.path("cause").toString();

            String finalMessage = """
                Mercado Pago error:
                status=%s
                error=%s
                message=%s
                cause=%s
                """.formatted(
                    ex.getStatusCode(),
                    error,
                    message,
                    cause
            );

            return new ExternalServiceException(finalMessage, ex);

        } catch (Exception parseEx) {

            return new ExternalServiceException("""
                Mercado Pago raw error:
                status=%s
                body=%s
                """.formatted(
                    ex.getStatusCode(),
                    responseBody
            ), ex);
        }
    }
}
