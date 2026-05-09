package status.zap.Application.commons.exception;

/**
 * Shape padrão de erro conforme contrato:
 * { "error": "not_found", "message": "Serviço não encontrado" }
 */
public record ErrorResponse(String error, String message) {}