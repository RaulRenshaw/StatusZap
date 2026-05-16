package status.zap.Application.plan.feature;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import status.zap.Application.auth.model.enums.AccountPlan;
import status.zap.Application.auth.repository.UserRepository;
import status.zap.Application.commons.exception.ForbiddenException;
import status.zap.Application.commons.exception.ResourceNotFoundException;

import java.util.UUID;

/**
 * Ponto único de verificação de features no backend.
 *
 * Uso:
 *   featureAccessService.requireFeature(userId, Feature.UNLIMITED_ORDERS);
 *   // lança ForbiddenException se o plano não tiver a feature
 *
 *   boolean ok = featureAccessService.hasFeature(userId, Feature.ADVANCED_ANALYTICS);
 */
@Service
@RequiredArgsConstructor
public class FeatureAccessService {

    private final UserRepository userRepository;
    private final PlanCapabilities capabilities;

    /** Verifica silenciosamente se o usuário tem a feature. */
    public boolean hasFeature(UUID userId, Feature feature) {
        AccountPlan plan = resolvePlan(userId);
        return capabilities.hasFeature(plan, feature);
    }

    /**
     * Exige que o usuário tenha a feature.
     * Lança {@link ForbiddenException} (HTTP 403) caso contrário.
     */
    public void requireFeature(UUID userId, Feature feature) {
        if (!hasFeature(userId, feature)) {
            throw new ForbiddenException(
                "Seu plano atual não inclui: " + feature.name() +
                ". Faça upgrade para o Premium."
            );
        }
    }

    /** Resolve o plano atual do usuário. */
    public AccountPlan resolvePlan(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"))
                .getAccountPlan();
    }
}
