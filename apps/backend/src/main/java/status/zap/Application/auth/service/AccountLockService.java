package status.zap.Application.auth.service;

import org.springframework.stereotype.Service;
import status.zap.Application.auth.model.UserEntity;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Gerencia bloqueio temporário de conta após falhas de login.
 * Bloqueio expira automaticamente após LOCK_DURATION.
 */
@Service
public class AccountLockService {

    private static final int MAX_ATTEMPTS   = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    public boolean isLocked(UserEntity user) {
        return user.getLockedUntil() != null
                && user.getLockedUntil().isAfter(LocalDateTime.now());
    }

    public void registerFailure(UserEntity user) {
        int attempts = user.getFailedAttempts() + 1;
        user.setFailedAttempts(attempts);

        if (attempts >= MAX_ATTEMPTS) {
            user.setLockedUntil(LocalDateTime.now().plus(LOCK_DURATION));
        }
    }

    public void reset(UserEntity user) {
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
    }
}
