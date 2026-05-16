package status.zap.Application.plan.usage;

/**
 * Lançada quando o usuário atinge o limite do plano para um tipo de uso.
 * O GlobalExceptionHandler a mapeia para HTTP 403.
 */
public class PlanLimitExceededException extends RuntimeException {

    private final UsageType type;
    private final long current;
    private final long limit;

    public PlanLimitExceededException(UsageType type, long current, long limit) {
        super(buildMessage(type, current, limit));
        this.type    = type;
        this.current = current;
        this.limit   = limit;
    }

    private static String buildMessage(UsageType type, long current, long limit) {
        return switch (type) {
            case ACTIVE_ORDERS ->
                "Limite de ordens ativas atingido (" + current + "/" + limit + "). " +
                "Finalize ordens existentes ou faça upgrade para o Premium.";
        };
    }

    public UsageType getType()    { return type; }
    public long getCurrent()       { return current; }
    public long getLimit()         { return limit; }
}
