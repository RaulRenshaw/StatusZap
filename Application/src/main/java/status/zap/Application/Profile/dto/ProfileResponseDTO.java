package status.zap.Application.profile.dto;

public record ProfileResponseDTO(
        String name,
        String slug,
        String phone,
        String address,
        String logoUrl,
        String greeting
) {}
