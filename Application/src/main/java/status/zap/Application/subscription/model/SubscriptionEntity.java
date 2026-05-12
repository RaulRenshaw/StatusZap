package status.zap.Application.subscription.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import status.zap.Application.auth.model.UserEntity;
import status.zap.Application.subscription.model.enums.SubscriptionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = "user")
public class SubscriptionEntity {

    @Id
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false, unique = true)
    private String externalReference;

    @Column(nullable = false)
    private String planCode;

    @Column(nullable = false)
    private String provider;

    @Column(name = "mp_preapproval_plan_id")
    private String mercadoPagoPlanId;

    @Column(name = "mp_preapproval_id", unique = true)
    private String mercadoPagoSubscriptionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    private Instant currentPeriodStart;
    private Instant currentPeriodEnd;
    private Instant nextBillingAt;
    private Instant lastPaymentAt;
    private String lastPaymentStatus;
    private String checkoutUrl;
    private Instant canceledAt;

    @Lob
    private String rawMetadata;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
