package status.zap.Application.Service.events;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import status.zap.Application.Service.dto.ServiceUpdatedEvent;
import status.zap.Application.Service.sse.SseService;

@Component
@RequiredArgsConstructor
public class ServiceStatusChangedListener {

    private final SseService sseService;

    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void on(ServiceStatusChangedEvent event) {

        sseService.send(
                event.publicToken(),
                "status-changed",
                new ServiceUpdatedEvent(
                        event.serviceId(),
                        event.status(),
                        event.updatedAt()
                )
        );
    }
}