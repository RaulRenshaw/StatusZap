package status.zap.Application.subscription.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import status.zap.Application.subscription.model.SubscriptionEntity;
import status.zap.Application.subscription.model.enums.SubscriptionStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<SubscriptionEntity, UUID> {
    Optional<SubscriptionEntity> findTopByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<SubscriptionEntity> findByMercadoPagoSubscriptionId(String mercadoPagoSubscriptionId);
    Optional<SubscriptionEntity> findByExternalReference(String externalReference);
    List<SubscriptionEntity> findByStatusIn(List<SubscriptionStatus> statuses);
}
