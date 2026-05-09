package status.zap.Application.Service.dto;

import java.time.Instant;

/**
 * PATCH /services/:id — edição parcial de campos (sem mudar status).
 * Todos os campos são opcionais; null = não alterar.
 */
public record UpdateServiceRequestDTO(
        String customerName,
        String customerPhone,
        String device,
        String observations,
        Instant estimatedReadAt,
        Integer price          // Integer (boxed) para aceitar null
) {}
