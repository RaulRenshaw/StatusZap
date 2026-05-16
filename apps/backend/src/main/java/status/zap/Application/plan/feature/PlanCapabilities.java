package status.zap.Application.plan.feature;

import org.springframework.stereotype.Component;
import status.zap.Application.auth.model.enums.AccountPlan;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Registro central de quais features cada plano possui.
 *
 * Para adicionar um novo plano ou feature:
 *  1. Adicione a feature em {@link Feature}
 *  2. Adicione aqui nos planos que devem tê-la
 *  Só isso — nenhuma outra alteração é necessária.
 */
@Component
public class PlanCapabilities {

    private static final Map<AccountPlan, Set<Feature>> PLANS;

    static {
        PLANS = new EnumMap<>(AccountPlan.class);

        PLANS.put(AccountPlan.FREE, EnumSet.of(
                Feature.FILE_UPLOADS        // upload básico liberado para todos
        ));

        PLANS.put(AccountPlan.PREMIUM, EnumSet.of(
                Feature.UNLIMITED_ORDERS,
                Feature.TEAM_MEMBERS,
                Feature.CUSTOM_BRANDING,
                Feature.ADVANCED_ANALYTICS,
                Feature.WHATSAPP_AUTOMATION,
                Feature.FILE_UPLOADS,
                Feature.API_ACCESS
        ));
    }

    public boolean hasFeature(AccountPlan plan, Feature feature) {
        return PLANS.getOrDefault(plan, EnumSet.noneOf(Feature.class))
                    .contains(feature);
    }

    /** Retorna cópia imutável das features do plano — útil para debug/admin. */
    public Set<Feature> featuresOf(AccountPlan plan) {
        return Set.copyOf(PLANS.getOrDefault(plan, EnumSet.noneOf(Feature.class)));
    }
}
