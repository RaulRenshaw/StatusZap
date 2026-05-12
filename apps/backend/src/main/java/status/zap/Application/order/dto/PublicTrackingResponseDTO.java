package status.zap.Application.order.dto;

import status.zap.Application.profile.dto.ProfileResponseDTO;

public record PublicTrackingResponseDTO(
        OrderResponseDTO order,
        ProfileResponseDTO profile
) {}
