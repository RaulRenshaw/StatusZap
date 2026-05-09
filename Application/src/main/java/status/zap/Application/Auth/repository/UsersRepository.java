package status.zap.Application.Auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import status.zap.Application.Auth.model.UsersEntity;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsersRepository extends JpaRepository<UsersEntity, UUID> {

    Optional<UsersEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    /** Quantas contas têm pelo menos 1 OS cadastrada */
    @Query("SELECT COUNT(DISTINCT s.user.id) FROM ObjetoService s")
    long countWithAtLeastOneService();
}
