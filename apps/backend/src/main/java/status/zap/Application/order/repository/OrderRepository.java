package status.zap.Application.order.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import status.zap.Application.order.model.ServiceOrder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<ServiceOrder, UUID> {

    @Query("""
        SELECT DISTINCT o
        FROM ServiceOrder o
        LEFT JOIN FETCH o.history
        WHERE o.user.id = :userId
        ORDER BY o.updatedAt DESC
    """)
    List<ServiceOrder> findByUserIdOrderByUpdatedAtDesc(@Param("userId") UUID userId);

    @Query("""
        SELECT o
        FROM ServiceOrder o
        LEFT JOIN FETCH o.history
        WHERE o.id = :id
    """)
    Optional<ServiceOrder> findByIdWithHistory(@Param("id") UUID id);

    @Query("""
        SELECT o
        FROM ServiceOrder o
        LEFT JOIN FETCH o.history
        WHERE o.publicToken = :publicToken
    """)
    Optional<ServiceOrder> findByPublicToken(@Param("publicToken") String publicToken);

    @Query("""
        SELECT DISTINCT o
        FROM ServiceOrder o
        LEFT JOIN FETCH o.history
        WHERE o.user.id = :userId
          AND o.publicToken LIKE CONCAT(:shortToken, '%')
    """)
    Optional<ServiceOrder> findByUserIdAndPublicTokenStartingWith(
            @Param("userId") UUID userId,
            @Param("shortToken") String shortToken
    );

    boolean existsByPublicToken(String publicToken);

    long countByUserId(UUID userId);

    @Query("SELECT COUNT(o) FROM ServiceOrder o WHERE o.createdAt > :since")
    long countCreatedAfter(@Param("since") Instant since);
}
