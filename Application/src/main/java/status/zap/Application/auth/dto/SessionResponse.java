package status.zap.Application.auth.dto;

import java.time.Instant;

public record SessionResponse(String token, Instant expiresAt) {}
