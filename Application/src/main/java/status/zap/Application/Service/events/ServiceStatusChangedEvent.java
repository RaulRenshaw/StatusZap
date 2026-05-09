package status.zap.Application.Service.events;

import java.time.Instant;
import java.util.UUID;

public record ServiceStatusChangedEvent(
        String publicToken,
        UUID serviceId,
        String status,
        Instant updatedAt
) {}