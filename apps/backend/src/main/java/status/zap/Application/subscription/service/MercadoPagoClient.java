package status.zap.Application.subscription.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import status.zap.Application.commons.exception.ExternalServiceException;
import status.zap.Application.subscription.config.MercadoPagoProperties;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class MercadoPagoClient {

    private final RestClient.Builder restClientBuilder;
    private final MercadoPagoProperties properties;
    private final ObjectMapper objectMapper;

    public JsonNode createPlan(Map<String, Object> payload) {
        return post("/preapproval_plan", payload);
    }

    public JsonNode createSubscription(Map<String, Object> payload) {
        return post("/preapproval", payload);
    }

    public JsonNode getSubscription(String subscriptionId) {
        return get("/preapproval/" + subscriptionId);
    }

    public JsonNode cancelSubscription(String subscriptionId) {
        return put("/preapproval/" + subscriptionId, Map.of("status", "cancelled"));
    }

    public JsonNode getAuthorizedPayment(String paymentId) {
        return get("/authorized_payments/" + paymentId);
    }

    public JsonNode getPayment(String paymentId) {
        return get("/v1/payments/" + paymentId);
    }

    private JsonNode post(String path, Map<String, Object> payload) {
        try {
            return restClient().post()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientResponseException ex) {
            throw buildExternalServiceException(ex);
        } catch (Exception ex) {
            throw new ExternalServiceException("Falha ao comunicar com o Mercado Pago.", ex);
        }
    }

    private JsonNode put(String path, Map<String, Object> payload) {
        try {
            return restClient().put()
                    .uri(path)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientResponseException ex) {
            throw buildExternalServiceException(ex);
        } catch (Exception ex) {
            throw new ExternalServiceException("Falha ao comunicar com o Mercado Pago.", ex);
        }
    }

    private JsonNode get(String path) {
        try {
            return restClient().get()
                    .uri(path)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientResponseException ex) {
            throw buildExternalServiceException(ex);
        } catch (Exception ex) {
            throw new ExternalServiceException("Falha ao comunicar com o Mercado Pago.", ex);
        }
    }

    private RestClient restClient() {
        return restClientBuilder
                .baseUrl(properties.getBaseUrl())
                .defaultHeader("Authorization", "Bearer " + properties.getAccessToken())
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .defaultHeaders(headers -> {
                    if (properties.isSandbox()) {
                        headers.add("X-scope", "stage");
                    }
                })
                .build();
    }

    private ExternalServiceException buildExternalServiceException(RestClientResponseException ex) {
        String message = "Mercado Pago respondeu com erro.";
        if (StringUtils.hasText(ex.getResponseBodyAsString())) {
            try {
                JsonNode body = objectMapper.readTree(ex.getResponseBodyAsString());
                message = body.path("message").asText(message);
                if (!StringUtils.hasText(message) && body.has("error")) {
                    message = body.path("error").asText("Mercado Pago respondeu com erro.");
                }
            } catch (Exception ignored) {
                message = ex.getResponseBodyAsString();
            }
        }
        return new ExternalServiceException(message, ex);
    }
}
