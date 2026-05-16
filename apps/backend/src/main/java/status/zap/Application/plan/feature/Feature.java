package status.zap.Application.plan.feature;

/**
 * Catálogo central de funcionalidades do sistema.
 * Adicionar uma feature aqui + em PlanCapabilities é tudo que é necessário
 * para controlá-la por plano.
 */
public enum Feature {
    // Ordens
    UNLIMITED_ORDERS,       // FREE tem limite de 20 ordens ativas

    // Equipe
    TEAM_MEMBERS,           // Múltiplos usuários por conta (futuro)

    // Branding
    CUSTOM_BRANDING,        // Logo própria na página de tracking

    // Analytics
    ADVANCED_ANALYTICS,     // Dashboard de métricas avançadas

    // Automação
    WHATSAPP_AUTOMATION,    // Mensagem automática ao mudar status

    // Storage
    FILE_UPLOADS,           // Upload de imagens na OS

    // API
    API_ACCESS              // Acesso via API key (futuro)
}
