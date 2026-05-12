package status.zap.Application.profile.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import status.zap.Application.auth.model.UserEntity;

import java.util.UUID;

@Entity
@Table(name = "profile",
       uniqueConstraints = @UniqueConstraint(columnNames = "slug"))
@Getter @Setter @Builder
@ToString(exclude = "user")
@AllArgsConstructor @NoArgsConstructor
public class ProfileEntity {

    @Id
    @UuidGenerator
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserEntity user;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String slug;

    private String phone;
    private String address;
    private String logoUrl;
    private String greeting;
}
