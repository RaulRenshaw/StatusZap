package status.zap.Application.Service.dto;

import jakarta.validation.constraints.NotNull;
import status.zap.Application.Service.model.enums.StatusServico;

/**
 * PATCH /services/:id/status
 */
public record UpdateStatusRequestDTO(
        @NotNull StatusServico status,
        String note            // mensagem opcional registrada no histórico
) {}
