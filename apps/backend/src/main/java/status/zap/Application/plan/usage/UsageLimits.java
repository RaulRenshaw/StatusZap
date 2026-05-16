package status.zap.Application.plan.usage;

import org.springframework.stereotype.Component;
import status.zap.Application.auth.model.enums.AccountPlan;

import java.util.EnumMap;
import java.util.Map;

/**
 * Define os limites de uso por plano.
 * {@code -1} significa ilimitado.
 */
@Component
public class UsageLimits {

    private static final long UNLIMITED = -1L;

    // limite FREE para ordens ativas
    public static final long FREE_ORDER_LIMIT = 20L;

    private static final Map<AccountPlan, Map<UsageType, Long>> LIMITS;

    static {
        LIMITS = new EnumMap<>(AccountPlan.class);

        Map<UsageType, Long> freeLimits = new EnumMap<>(UsageType.class);
        freeLimits.put(UsageType.ACTIVE_ORDERS, FREE_ORDER_LIMIT);
        LIMITS.put(AccountPlan.FREE, freeLimits);

        Map<UsageType, Long> premiumLimits = new EnumMap<>(UsageType.class);
        premiumLimits.put(UsageType.ACTIVE_ORDERS, UNLIMITED);
        LIMITS.put(AccountPlan.PREMIUM, premiumLimits);
    }

    /** Retorna o limite do tipo para o plano. -1 = ilimitado. */
    public long getLimit(AccountPlan plan, UsageType type) {
        return LIMITS.getOrDefault(plan, Map.of())
                     .getOrDefault(type, UNLIMITED);
    }

    public boolean isUnlimited(AccountPlan plan, UsageType type) {
        return getLimit(plan, type) == UNLIMITED;
    }
}
