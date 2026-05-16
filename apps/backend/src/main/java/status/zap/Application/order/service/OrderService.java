package status.zap.Application.order.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import status.zap.Application.auth.model.UserEntity;
import status.zap.Application.auth.repository.UserRepository;
import status.zap.Application.commons.exception.ConflictException;
import status.zap.Application.commons.exception.ForbiddenException;
import status.zap.Application.commons.exception.ResourceNotFoundException;
import status.zap.Application.order.dto.*;
import status.zap.Application.order.events.OrderStatusChangedEvent;
import status.zap.Application.order.model.ServiceOrder;
import status.zap.Application.order.model.StatusEvent;
import status.zap.Application.order.model.enums.OrderStatus;
import status.zap.Application.order.repository.OrderRepository;
import status.zap.Application.plan.feature.Feature;
import status.zap.Application.plan.feature.FeatureAccessService;
import status.zap.Application.plan.usage.UsageService;
import status.zap.Application.plan.usage.UsageType;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final FeatureAccessService featureAccessService;
    private final UsageService usageService;
    private final SecureRandom secureRandom = new SecureRandom();

    // ── List ─────────────────────────────────────────────────────────────────

    public List<OrderResponseDTO> listByUser(UUID userId) {
        return orderRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── Get by ID ─────────────────────────────────────────────────────────────

    public OrderResponseDTO getById(UUID orderId, UUID userId) {
        return toResponse(findAndAuthorize(orderId, userId));
    }

    // ── Create ────────────────────────────────────────────────────────────────

    @Transactional
    public OrderResponseDTO create(CreateOrderRequestDTO dto, UUID userId) {
        // Verificação de limite de ordens ativas (plano FREE = 20)
        // Usuários PREMIUM têm Feature.UNLIMITED_ORDERS e pulam o check
        if (!featureAccessService.hasFeature(userId, Feature.UNLIMITED_ORDERS)) {
            usageService.requireUnderLimit(userId, UsageType.ACTIVE_ORDERS);
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        ServiceOrder order = ServiceOrder.builder()
                .user(user)
                .publicToken(generateUniqueToken())
                .customerName(dto.customerName())
                .customerPhone(dto.customerPhone())
                .device(dto.device())
                .observations(dto.observations())
                .estimatedReadyAt(dto.estimatedReadyAt())
                .priceInCents(dto.priceInCents())
                .status(OrderStatus.RECEBIDO)
                .build();

        StatusEvent firstEvent = StatusEvent.builder()
                .serviceOrder(order)
                .status(OrderStatus.RECEBIDO)
                .at(Instant.now())
                .note("OS criada")
                .build();

        order.getHistory().add(firstEvent);
        return toResponse(orderRepository.save(order));
    }

    // ── Update fields ────────────────────────────────────────────────────────

    @Transactional
    public OrderResponseDTO update(UUID orderId, UpdateOrderRequestDTO dto, UUID userId) {
        ServiceOrder order = findAndAuthorize(orderId, userId);

        if (dto.customerName()    != null) order.setCustomerName(dto.customerName());
        if (dto.customerPhone()   != null) order.setCustomerPhone(dto.customerPhone());
        if (dto.device()          != null) order.setDevice(dto.device());
        if (dto.observations()    != null) order.setObservations(dto.observations());
        if (dto.estimatedReadyAt()!= null) order.setEstimatedReadyAt(dto.estimatedReadyAt());
        if (dto.priceInCents()    != null) order.setPriceInCents(dto.priceInCents());

        return toResponse(orderRepository.save(order));
    }

    // ── Update status ────────────────────────────────────────────────────────

    @Transactional
    public OrderResponseDTO updateStatus(UUID orderId, UpdateOrderStatusRequestDTO dto, UUID userId) {
        ServiceOrder order = findAndAuthorize(orderId, userId);

        // Idempotência — não registra evento duplicado
        if (Objects.equals(order.getStatus(), dto.status())) {
            return toResponse(order);
        }

        order.setStatus(dto.status());

        order.getHistory().add(StatusEvent.builder()
                .serviceOrder(order)
                .status(dto.status())
                .at(Instant.now())
                .note(dto.note())
                .build());

        try {
            orderRepository.flush();
            eventPublisher.publishEvent(new OrderStatusChangedEvent(
                    order.getPublicToken(),
                    order.getId(),
                    order.getStatus(),
                    order.getUpdatedAt()
            ));
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ConflictException("Ordem atualizada por outra operação. Tente novamente.");
        }

        return toResponse(order);
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    @Transactional
    public void delete(UUID orderId, UUID userId) {
        orderRepository.delete(findAndAuthorize(orderId, userId));
    }

    // ── Public tracking ───────────────────────────────────────────────────────

    public OrderResponseDTO findByPublicToken(String publicToken) {
        return toResponse(
                orderRepository.findByPublicToken(publicToken)
                        .orElseThrow(() -> new ResourceNotFoundException("Ordem não encontrada"))
        );
    }

    public OrderResponseDTO findByUserIdAndShortToken(UUID userId, String shortToken) {
        return toResponse(
                orderRepository.findByUserIdAndPublicTokenStartingWith(userId, shortToken)
                        .orElseThrow(() -> new ResourceNotFoundException("Ordem não encontrada"))
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private ServiceOrder findAndAuthorize(UUID orderId, UUID userId) {
        ServiceOrder order = orderRepository.findByIdWithHistory(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem não encontrada"));

        if (!order.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Acesso negado a esta ordem");
        }
        return order;
    }

    private String generateUniqueToken() {
        String token;
        do {
            byte[] bytes = new byte[15]; // 15 bytes → 20 chars Base64 URL-safe
            secureRandom.nextBytes(bytes);
            token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        } while (orderRepository.existsByPublicToken(token));
        return token;
    }

    public OrderResponseDTO toResponse(ServiceOrder o) {
        List<StatusEventDTO> history = o.getHistory().stream()
                .map(e -> new StatusEventDTO(e.getStatus(), e.getAt(), e.getNote()))
                .toList();

        return new OrderResponseDTO(
                o.getId(),
                o.getUser().getId(),
                o.getPublicToken(),
                o.getCustomerName(),
                o.getCustomerPhone(),
                o.getDevice(),
                o.getObservations(),
                o.getStatus(),
                o.getCreatedAt(),
                o.getUpdatedAt(),
                o.getEstimatedReadyAt(),
                o.getPriceInCents(),
                history
        );
    }
}
