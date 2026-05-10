package status.zap.Application.order.sse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Gerencia conexões SSE por publicToken.
 * Thread-safe: ConcurrentHashMap + CopyOnWriteArrayList.
 */
@Slf4j
@Service
public class SseService {

    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String token) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        emitters.computeIfAbsent(token, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> remove(token, emitter));
        emitter.onTimeout(()    -> remove(token, emitter));
        emitter.onError(ex      -> remove(token, emitter));

        sendConnected(emitter);
        log.debug("SSE subscribed: token={}", token);
        return emitter;
    }

    public void send(String token, String eventName, Object payload) {
        List<SseEmitter> list = emitters.get(token);
        if (list == null || list.isEmpty()) return;

        List<SseEmitter> dead = new CopyOnWriteArrayList<>();
        for (SseEmitter emitter : list) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(payload));
            } catch (Exception e) {
                dead.add(emitter);
            }
        }

        list.removeAll(dead);
        if (list.isEmpty()) emitters.remove(token);
    }

    private void remove(String token, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(token);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) emitters.remove(token);
        }
    }

    private void sendConnected(SseEmitter emitter) {
        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (Exception ignored) {}
    }

    @Scheduled(fixedRate = 30_000)
    public void heartbeat() {
        emitters.forEach((token, list) ->
            list.forEach(emitter -> {
                try {
                    emitter.send(SseEmitter.event().name("ping").data("keepalive"));
                } catch (Exception ignored) {}
            })
        );
    }
}
