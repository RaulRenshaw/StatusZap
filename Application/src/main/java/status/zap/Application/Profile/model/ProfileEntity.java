package status.zap.Application.Profile.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import status.zap.Application.Auth.model.UsersEntity;

import java.util.UUID;

@Entity
@Table(name = "profile",
        uniqueConstraints = @UniqueConstraint(columnNames = "slug"))
@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class ProfileEntity {

    @Id
    @UuidGenerator
    private UUID id;

    /** Dono do perfil — FK para users */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UsersEntity user;

    @NotBlank
    private String name;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String slug;

    private String phone;
    private String address;
    private String logoUrl;
    private String greeting;
}