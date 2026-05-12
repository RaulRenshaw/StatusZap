package status.zap.Application.order.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Status de uma Ordem de Serviço.
 * Serializado em lowercase para o frontend (ex: "recebido").
 */
public enum OrderStatus {
    RECEBIDO,
    ANALISE,
    CONSERTO,
    PRONTO,
    ENTREGUE;

    @JsonValue
    public String toJson() {
        return this.name().toLowerCase();
    }

    @JsonCreator
    public static OrderStatus fromJson(String value) {
        if (value == null) throw new IllegalArgumentException("Status não pode ser nulo");
        try {
            return OrderStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Status inválido: " + value +
                ". Valores aceitos: recebido, analise, conserto, pronto, entregue"
            );
        }
    }
}
