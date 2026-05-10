package status.zap.Application.order.events;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import status.zap.Application.order.dto.OrderUpdatedEventDTO;
import status.zap.Application.order.sse.SseService;

@Component
@RequiredArgsConstructor
public class OrderStatusChangedListener {

    private final SseService sseService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void on(OrderStatusChangedEvent event) {
        sseService.send(
                event.publicToken(),
                "status-changed",
                new OrderUpdatedEventDTO(
                        event.orderId(),
                        event.status(),
                        event.updatedAt()
                )
        );
    }
}
