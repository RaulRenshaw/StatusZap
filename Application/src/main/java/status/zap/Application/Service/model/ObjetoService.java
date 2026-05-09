package status.zap.Application.Service.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import status.zap.Application.Auth.model.UsersEntity;
import status.zap.Application.Service.model.enums.StatusServico;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "objeto_service")
@Getter
@Setter
@Builder
@ToString(exclude = {"user", "history"})
@AllArgsConstructor
@NoArgsConstructor
public class ObjetoService {

    @Id
    @UuidGenerator
    private UUID id;

    /** Dono da OS — FK para users */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private UsersEntity user;

    /** Token público para rastreamento (gerado pelo back) */
    @Column(nullable = false, unique = true)
    private String publicToken;

    // "costumer" → "customer" (typo original corrigido)
    @Column(nullable = false)
    private String customerName;

    private String customerPhone;

    @Column(nullable = false)
    private String device;

    private String observations;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusServico statusServico;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    private Instant estimatedReadAt;

    /** Preço em centavos (int evita problemas de ponto flutuante) */
    //private int price;

    /** Histórico de transições de status — tabela separada */
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("at ASC")
    @Builder.Default
    private List<StatusEvent> history = new ArrayList<>();

    @Version
    private Long version;

    // -------------------------------------------------------------------------
    // Lifecycle hooks
    // -------------------------------------------------------------------------

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
