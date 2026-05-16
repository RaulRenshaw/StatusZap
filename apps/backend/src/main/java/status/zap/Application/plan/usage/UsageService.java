package status.zap.Application.plan.usage;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import status.zap.Application.auth.model.enums.AccountPlan;
import status.zap.Application.auth.repository.UserRepository;
import status.zap.Application.commons.exception.ResourceNotFoundException;
import status.zap.Application.order.repository.OrderRepository;

import java.util.UUID;

/**
 * Serviço de metering de uso.
 *
 * Uso nos services:
 *   usageService.requireUnderLimit(userId, UsageType.ACTIVE_ORDERS);
 *   // lança PlanLimitExceededException se limite atingido
 */
@Service
@RequiredArgsConstructor
public class UsageService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final UsageLimits limits;

    /** Retorna uso atual do tipo para o usuário. */
    public long getUsage(UUID userId, UsageType type) {
        return switch (type) {
            case ACTIVE_ORDERS -> orderRepository.countActiveByUserId(userId);
        };
    }

    /** Retorna o limite do tipo para o plano do usuário. -1 = ilimitado. */
    public long getLimit(UUID userId, UsageType type) {
        AccountPlan plan = resolvePlan(userId);
        return limits.getLimit(plan, type);
    }

    /** Retorna true se o usuário ultrapassou ou igualou o limite. */
    public boolean exceeded(UUID userId, UsageType type) {
        AccountPlan plan = resolvePlan(userId);
        if (limits.isUnlimited(plan, type)) return false;
        return getUsage(userId, type) >= limits.getLimit(plan, type);
    }

    /**
     * Exige que o usuário esteja abaixo do limite.
     * Lança {@link PlanLimitExceededException} (HTTP 403) caso contrário.
     */
    public void requireUnderLimit(UUID userId, UsageType type) {
        if (exceeded(userId, type)) {
            long current = getUsage(userId, type);
            long limit   = getLimit(userId, type);
            throw new PlanLimitExceededException(type, current, limit);
        }
    }

    /**
     * DTO de resumo de uso — enviado ao frontend para mostrar a barra de progresso.
     */
    public UsageSummary getSummary(UUID userId, UsageType type) {
        AccountPlan plan = resolvePlan(userId);
        long current = getUsage(userId, type);
        long limit   = limits.getLimit(plan, type);
        return new UsageSummary(type, current, limit, limits.isUnlimited(plan, type));
    }

    private AccountPlan resolvePlan(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"))
                .getAccountPlan();
    }

    public record UsageSummary(
            UsageType type,
            long current,
            long limit,
            boolean unlimited
    ) {}
}
