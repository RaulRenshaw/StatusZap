package status.zap.Application.Service.service;


import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import status.zap.Application.Auth.model.UsersEntity;
import status.zap.Application.Auth.repository.UsersRepository;
import status.zap.Application.Service.dto.*;
import status.zap.Application.Service.events.ServiceStatusChangedEvent;
import status.zap.Application.Service.model.ObjetoService;
import status.zap.Application.Service.model.StatusEvent;
import status.zap.Application.Service.model.enums.StatusServico;
import status.zap.Application.Service.repository.ServiceRepository;
import status.zap.Application.Service.sse.SseService;
import status.zap.Application.commons.exception.ConflictException;
import status.zap.Application.commons.exception.ForbiddenException;
import status.zap.Application.commons.exception.ResourceNotFoundException;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final UsersRepository usersRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final SseService sseService;
    private final ApplicationEventPublisher publisher;

    public ServiceService(ServiceRepository serviceRepository, UsersRepository usersRepository, SseService sseService, ApplicationEventPublisher publisher) {
        this.serviceRepository = serviceRepository;
        this.usersRepository = usersRepository;
        this.sseService = sseService;
        this.publisher = publisher;
    }

    // =========================================================================
    // GET /services — lista do usuário autenticado
    // =========================================================================
    public List<ServiceResponseDTO> listByUser(UUID userId) {
        return serviceRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================================
    // GET /services/:id
    // =========================================================================
    public ServiceResponseDTO getById(UUID serviceId, UUID userId) {
        ObjetoService service = findAndAuthorize(serviceId, userId);
        return toResponse(service);
    }

    // =========================================================================
    // POST /services
    // =========================================================================
    @Transactional
    public ServiceResponseDTO create(CreateServiceRequestDTO dto, UUID userId) {
        UsersEntity user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        String publicToken = generateUniqueToken();

        ObjetoService service = ObjetoService.builder()
                .user(user)
                .publicToken(publicToken)
                .customerName(dto.customerName())
                .customerPhone(dto.customerPhone())
                .device(dto.device())
                .observations(dto.observations())
                .estimatedReadAt(dto.estimatedReadAt())
                //.price(dto.price())
                .statusServico(StatusServico.RECEBIDO)
                .build();

        // Primeiro evento de histórico — status inicial
        StatusEvent firstEvent = StatusEvent.builder()
                .service(service)
                .statusServico(StatusServico.RECEBIDO)
                .at(Instant.now())
                .note("OS criada")
                .build();

        service.getHistory().add(firstEvent);

        return toResponse(serviceRepository.save(service));
    }

    // =========================================================================
    // PATCH /services/:id — edição de campos (sem mudar status)
    // =========================================================================
    @Transactional
    public ServiceResponseDTO update(UUID serviceId, UpdateServiceRequestDTO dto, UUID userId) {
        ObjetoService service = findAndAuthorize(serviceId, userId);

        if (dto.customerName() != null)    service.setCustomerName(dto.customerName());
        if (dto.customerPhone() != null)   service.setCustomerPhone(dto.customerPhone());
        if (dto.device() != null)          service.setDevice(dto.device());
        if (dto.observations() != null)    service.setObservations(dto.observations());
        if (dto.estimatedReadAt() != null) service.setEstimatedReadAt(dto.estimatedReadAt());
       // if (dto.price() != null)           service.setPrice(dto.price());

        return toResponse(serviceRepository.save(service));
    }

    // =========================================================================
    // PATCH /services/:id/status
    // =========================================================================
    @Transactional
    public ServiceResponseDTO updateStatus(
            UUID serviceId,
            UpdateStatusRequestDTO dto,
            UUID userId
    ) {
        ObjetoService service = findAndAuthorize(serviceId, userId);

        // idempotência
        if (Objects.equals(service.getStatusServico(), dto.status())) {
            return toResponse(service);
        }

        service.setStatusServico(dto.status());

        StatusEvent event = StatusEvent.builder()
                .service(service)
                .statusServico(dto.status())
                .at(Instant.now())
                .note(dto.note())
                .build();

        service.getHistory().add(event);

        try {
            serviceRepository.flush();

            publisher.publishEvent(new ServiceStatusChangedEvent(
                            service.getPublicToken(),
                            service.getId(),
                            service.getStatusServico().name(),
                            service.getUpdatedAt()
                    )
            );

        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ConflictException(
                    "Serviço atualizado por outra operação"
            );
        }

        return toResponse(service);
    }

    // =========================================================================
    // DELETE /services/:id
    // =========================================================================
    @Transactional
    public void delete(UUID serviceId, UUID userId) {
        ObjetoService service = findAndAuthorize(serviceId, userId);
        serviceRepository.delete(service);
    }

    // =========================================================================
    // Rastreamento público
    // =========================================================================

    /** GET /public/:token */
    public ServiceResponseDTO findByPublicToken(String publicToken) {
        return toResponse(serviceRepository.findByPublicToken(publicToken)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado")));
    }

    /** GET /public/:slug/:short — resolve slug → userId → OS pelo short token */
    public ServiceResponseDTO findBySlugAndShort(UUID userId, String short_) {
        return toResponse(serviceRepository.findByUserIdAndPublicTokenStartingWith(userId, short_)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado")));
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private ObjetoService findAndAuthorize(UUID serviceId, UUID userId) {
        ObjetoService service = serviceRepository.findByIdWithHistory(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));

        if (!service.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Acesso negado a este serviço");
        }

        return service;
    }

    /**
     * Gera um publicToken URL-safe único (20 caracteres).
     * Loop garante ausência de colisão mesmo com alto volume.
     */
    private String generateUniqueToken() {
        String token;
        do {
            byte[] bytes = new byte[15]; // 15 bytes → 20 chars Base64
            secureRandom.nextBytes(bytes);
            token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        } while (serviceRepository.existsByPublicToken(token));
        return token;
    }

    // =========================================================================
    // Mapper
    // =========================================================================

    public ServiceResponseDTO toResponse(ObjetoService s) {
        List<StatusEventDTO> history = s.getHistory().stream()
                .map(e -> new StatusEventDTO(e.getStatusServico(), e.getAt(), e.getNote()))
                .toList();

        return new ServiceResponseDTO(
                s.getId(),
                s.getUser().getId(),
                s.getPublicToken(),
                s.getCustomerName(),
                s.getCustomerPhone(),
                s.getDevice(),
                s.getObservations(),
                s.getStatusServico(),
                s.getCreatedAt(),
                s.getUpdatedAt(),
                s.getEstimatedReadAt(),
                //s.getPrice(),
                history
        );
    }
}
