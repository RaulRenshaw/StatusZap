package status.zap.Application.subscription.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import status.zap.Application.subscription.model.SubscriptionEventEntity;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionEventRepository extends JpaRepository<SubscriptionEventEntity, UUID> {
    boolean existsByProviderEventIdAndProviderTopic(String providerEventId, String providerTopic);
    Optional<SubscriptionEventEntity> findByProviderEventIdAndProviderTopic(String providerEventId, String providerTopic);
}
