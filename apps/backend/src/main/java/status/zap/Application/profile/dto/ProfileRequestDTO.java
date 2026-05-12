package status.zap.Application.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ProfileRequestDTO(
        @NotBlank String name,
        @NotBlank
        @Pattern(regexp = "^[a-z0-9-]{3,40}$",
                 message = "Slug deve ter 3-40 caracteres: letras minúsculas, números e hífens")
        String slug,
        String phone,
        String address,
        String logoUrl,
        String greeting
) {}
