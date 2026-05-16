-- ============================================================
-- Migration: performance indexes
-- Aplicar em: V{next}__add_performance_indexes.sql
-- ============================================================

-- Ordens: buscas por usuário, status e token público
CREATE INDEX IF NOT EXISTS idx_orders_user_id
    ON service_order(user_id);

CREATE INDEX IF NOT EXISTS idx_orders_status
    ON service_order(status);

CREATE INDEX IF NOT EXISTS idx_orders_public_token
    ON service_order(public_token);

-- Composto para listagem do dashboard (user + recentes)
CREATE INDEX IF NOT EXISTS idx_orders_user_updated
    ON service_order(user_id, updated_at DESC);

-- Assinaturas: buscas por usuário e status
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
    ON subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
    ON subscriptions(status);

-- External reference (usado na reconciliação do webhook)
CREATE INDEX IF NOT EXISTS idx_subscriptions_ext_ref
    ON subscriptions(external_reference);

-- Eventos de subscription (deduplicação de webhooks)
CREATE INDEX IF NOT EXISTS idx_sub_events_provider
    ON subscription_events(provider_event_id, provider_topic);
