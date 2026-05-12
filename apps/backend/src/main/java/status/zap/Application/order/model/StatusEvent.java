package status.zap.Application.order.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import status.zap.Application.order.model.enums.OrderStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * Evento de mudança de status dentro do histórico de uma OS.
 */
@Entity
@Table(name = "status_event")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StatusEvent {

    @Id
    @UuidGenerator
    private UUID id;

    /** FK para a OS dona deste evento */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_order_id", nullable = false)
    private ServiceOrder serviceOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    /** Momento em que o status foi registrado */
    @Column(nullable = false)
    private Instant at;

    /** Nota opcional do técnico */
    private String note;
}
