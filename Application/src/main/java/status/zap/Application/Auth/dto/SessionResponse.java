package status.zap.Application.Auth.dto;

import java.time.Instant;

public record SessionResponse(
        String token,
        Instant expiresAt   // adicionado conforme contrato
) {}