package status.zap.Application.Service.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Status de uma Ordem de Serviço.
 *
 * O contrato define os valores em lowercase (ex: "recebido").
 * @JsonValue / @JsonCreator garantem serialização correta
 * sem alterar os nomes dos constantes Java.
 */
public enum StatusServico {
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
    public static StatusServico fromJson(String value) {
        if (value == null) throw new IllegalArgumentException("Status não pode ser nulo");
        try {
            return StatusServico.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status inválido: " + value +
                    ". Valores aceitos: recebido, analise, conserto, pronto, entregue");
        }
    }
}
