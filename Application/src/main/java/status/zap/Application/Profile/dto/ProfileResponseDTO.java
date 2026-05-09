package status.zap.Application.Profile.dto;

/**
 * Shape de ShopProfile retornado pelo contrato.
 */
public record ProfileResponseDTO(
        String name,
        String slug,
        String phone,
        String address,
        String logoUrl,
        String greeting
) {}