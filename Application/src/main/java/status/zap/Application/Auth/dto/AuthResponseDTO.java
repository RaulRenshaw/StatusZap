package status.zap.Application.Auth.dto;

public record AuthResponseDTO(
        UserResponse user,
        SessionResponse session
) {}