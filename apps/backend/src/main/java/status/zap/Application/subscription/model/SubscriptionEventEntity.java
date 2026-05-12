package status.zap.Application.subscription.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "subscription_events", uniqueConstraints = {
        @UniqueConstraint(name = "uk_subscription_events_provider_event", columnNames = {"provider_event_id", "provider_topic"})
})
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubscriptionEventEntity {

    @Id
    @UuidGenerator
    private UUID id;

    @Column(name = "provider_event_id", nullable = false)
    private String providerEventId;

    @Column(name = "provider_topic", nullable = false)
    private String providerTopic;

    @Lob
    @Column(nullable = false)
    private String payload;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant processedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
