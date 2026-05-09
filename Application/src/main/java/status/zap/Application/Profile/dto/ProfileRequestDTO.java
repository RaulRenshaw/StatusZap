package status.zap.Application.Profile.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Body de PUT /profile — todos os opcionais podem ser nulos.
 */
public record ProfileRequestDTO(
        @NotBlank String name,
        @NotBlank String slug,
        String phone,
        String address,
        String logoUrl,
        String greeting
) {}