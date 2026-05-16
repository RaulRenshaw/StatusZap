package status.zap.Application.plan.usage;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import status.zap.Application.auth.dto.AuthenticatedUser;

/**
 * Expõe o resumo de uso do usuário ao frontend.
 * GET /api/usage/summary  → UsageService.UsageSummary
 */
@RestController
@RequestMapping("/api/usage")
@RequiredArgsConstructor
public class UsageController {

    private final UsageService usageService;

    @GetMapping("/summary")
    public ResponseEntity<UsageService.UsageSummary> summary(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(
                usageService.getSummary(user.id(), UsageType.ACTIVE_ORDERS)
        );
    }
}
