package status.zap.Application.Service.dto;

import status.zap.Application.Profile.dto.ProfileResponseDTO;
import status.zap.Application.Service.dto.ServiceResponseDTO;

/**
 * Shape retornado pelos endpoints públicos de rastreamento:
 *   GET /public/:token
 *   GET /public/:slug/:short
 *
 * Combina os dados do serviço com o perfil da loja dona da OS.
 */
public record PublicTrackingResponseDTO(
        ServiceResponseDTO service,
        ProfileResponseDTO profile
) {}
