package status.zap.Application.admin.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import status.zap.Application.admin.dto.AdminAccountDTO;
import status.zap.Application.admin.dto.AdminMetricsDTO;
import status.zap.Application.auth.repository.UserRepository;
import status.zap.Application.order.repository.OrderRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public AdminMetricsDTO getMetrics() {
        return new AdminMetricsDTO(
                userRepository.count(),
                orderRepository.count(),
                orderRepository.countCreatedAfter(Instant.now().minus(30, ChronoUnit.DAYS)),
                userRepository.countWithAtLeastOneOrder()
        );
    }

    /**
     * TODO: N+1 — substituir por query com JOIN + GROUP BY COUNT
     * quando volume de contas crescer.
     */
    public List<AdminAccountDTO> getAccounts() {
        return userRepository.findAll().stream()
                .map(u -> new AdminAccountDTO(
                        u.getId(),
                        u.getEmail(),
                        u.getShopName(),
                        u.getRole().name().toLowerCase(),
                        orderRepository.countByUserId(u.getId())
                ))
                .toList();
    }
}
