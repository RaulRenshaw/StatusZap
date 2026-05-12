package status.zap.Application.order.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import status.zap.Application.auth.model.UserEntity;
import status.zap.Application.order.model.enums.OrderStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Ordem de Serviço — entidade principal do domínio.
 * Renomeada de ObjetoService para ServiceOrder.
 */
@Entity
@Table(name = "service_order")
@Getter
@Setter
@Builder
@ToString(exclude = {"user", "history"})
@AllArgsConstructor
@NoArgsConstructor
public class ServiceOrder {

    @Id
    @UuidGenerator
    private UUID id;

    /** Dono da OS — FK para users */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private UserEntity user;

    /** Token público para rastreamento (gerado pelo back, URL-safe) */
    @Column(nullable = false, unique = true)
    private String publicToken;

    @Column(nullable = false)
    private String customerName;

    private String customerPhone;

    @Column(nullable = false)
    private String device;

    /** Descrição do problema / observações unificadas */
    private String observations;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    private Instant estimatedReadyAt;

    /** Preço em centavos — Integer (nullable) para aceitar ausência */
    private Integer priceInCents;

    /** Histórico de transições de status */
    @OneToMany(mappedBy = "serviceOrder", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("at ASC")
    @Builder.Default
    private List<StatusEvent> history = new ArrayList<>();

    /** Optimistic locking — evita sobrescrita de atualizações concorrentes */
    @Version
    private Long version;

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
