package status.zap.Application.Auth.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import status.zap.Application.Auth.model.enums.Roles;
import status.zap.Application.Profile.model.ProfileEntity;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@ToString
@AllArgsConstructor
@NoArgsConstructor

public class UsersEntity {
    @Id
    @UuidGenerator
    private UUID id;

    @NotBlank
    private String password;

    @NotBlank
    @Column(unique = true)
    private String email;

    private String shopName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Roles roles;

    private int failed_attempts;

    @OneToOne(fetch = FetchType.LAZY)
    private ProfileEntity profile;

    private LocalDateTime lockedUntil;

}

