package status.zap.Application.profile.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import status.zap.Application.profile.model.ProfileEntity;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<ProfileEntity, UUID> {
    Optional<ProfileEntity> findBySlug(String slug);
    Optional<ProfileEntity> findByUserId(UUID userId);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndUserIdNot(String slug, UUID userId);
}
