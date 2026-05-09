package status.zap.Application.Service.dto;

import status.zap.Application.Service.model.enums.StatusServico;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Shape completo de Service retornado pelo contrato em todos os endpoints
 * de serviços (GET /services, GET /services/:id, POST /services, etc.).
 */
public record ServiceResponseDTO(
        UUID id,
        UUID userId,
        String publicToken,
        String customerName,
        String customerPhone,
        String device,
        String observations,
        StatusServico status,
        Instant createdAt,
        Instant updatedAt,
        Instant estimatedReadAt,
        //int price,
        List<StatusEventDTO> history
) {}
