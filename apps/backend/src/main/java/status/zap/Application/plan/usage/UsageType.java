package status.zap.Application.plan.usage;

/**
 * Tipos de uso rastreados pelo sistema de metering.
 * Cada tipo tem um limite associado por plano em {@link UsageLimits}.
 */
public enum UsageType {
    ACTIVE_ORDERS       // Ordens não-finalizadas (aberto, em progresso)
}
