package status.zap.Application.Service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import status.zap.Application.Service.model.ObjetoService;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface ServiceRepository extends JpaRepository<ObjetoService, UUID> {

    @Query("""
        SELECT DISTINCT s
        FROM ObjetoService s
        LEFT JOIN FETCH s.history
        WHERE s.user.id = :userId
        ORDER BY s.updatedAt DESC
    """)
    List<ObjetoService> findByUserIdOrderByUpdatedAtDesc(
            @Param("userId") UUID userId
    );

    @Query("""
        SELECT s
        FROM ObjetoService s
        LEFT JOIN FETCH s.history
        WHERE s.id = :id
    """)
    Optional<ObjetoService> findByIdWithHistory(
            @Param("id") UUID id
    );

    @Query("""
        SELECT s
        FROM ObjetoService s
        LEFT JOIN FETCH s.history
        WHERE s.publicToken = :publicToken
    """)
    Optional<ObjetoService> findByPublicToken(
            @Param("publicToken") String publicToken
    );

    @Query("""
        SELECT DISTINCT s
        FROM ObjetoService s
        LEFT JOIN FETCH s.history
        WHERE s.user.id = :userId
          AND s.publicToken LIKE CONCAT(:short, '%')
    """)
    Optional<ObjetoService> findByUserIdAndPublicTokenStartingWith(
            @Param("userId") UUID userId,
            @Param("short") String short_
    );

    boolean existsByPublicToken(String publicToken);

    long countByUserId(UUID userId);

    @Query("""
        SELECT COUNT(s)
        FROM ObjetoService s
        WHERE s.createdAt > :since
    """)
    long countCreatedAfter(@Param("since") Instant since);
}