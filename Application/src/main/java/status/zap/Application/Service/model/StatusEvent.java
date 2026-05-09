package status.zap.Application.Service.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import status.zap.Application.Service.model.enums.StatusServico;

import java.time.Instant;
import java.util.UUID;

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
    @JoinColumn(nullable = false)
    private ObjetoService service;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusServico statusServico;

    /** ISO-8601 — momento em que o status foi registrado */
    @Column(nullable = false)
    private Instant at;

    private String note;
}
