package status.zap.Application.Auth.service;
import org.springframework.stereotype.Service;
import status.zap.Application.Auth.model.UsersEntity;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class AccountLockService {

    private static final int MAX_ATTEMPTS = 5;
    private static final Duration LOCK_TIME = Duration.ofMinutes(15);

    public boolean isLocked(UsersEntity user) {
        return user.getLockedUntil() != null
                && user.getLockedUntil().isAfter(LocalDateTime.now());
    }

    public void registerFailure(UsersEntity user) {
        int attempts = user.getFailed_attempts() + 1;
        user.setFailed_attempts(attempts);

        if (attempts >= MAX_ATTEMPTS) {
            user.setLockedUntil(LocalDateTime.now().plus(LOCK_TIME));
        }
    }

    public void reset(UsersEntity user) {
        user.setFailed_attempts(0);
        user.setLockedUntil(null);
    }
}