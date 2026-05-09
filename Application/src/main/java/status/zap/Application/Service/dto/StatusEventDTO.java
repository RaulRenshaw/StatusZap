package status.zap.Application.Service.dto;

import status.zap.Application.Service.model.enums.StatusServico;

import java.time.Instant;

/**
 * Shape do objeto StatusEvent dentro de history[].
 */
public record StatusEventDTO(
        StatusServico status,
        Instant at,
        String note
) {}
