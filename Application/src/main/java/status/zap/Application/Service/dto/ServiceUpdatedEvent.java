package status.zap.Application.Service.dto;

import java.time.Instant;
import java.util.UUID;

public record ServiceUpdatedEvent(
        UUID id,
        String status,
        Instant updatedAt
) {}