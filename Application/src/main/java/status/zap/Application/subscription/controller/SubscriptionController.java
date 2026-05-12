package status.zap.Application.subscription.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import status.zap.Application.auth.dto.AuthenticatedUser;
import status.zap.Application.subscription.dto.CreateSubscriptionCheckoutRequestDTO;
import status.zap.Application.subscription.dto.SubscriptionCheckoutResponseDTO;
import status.zap.Application.subscription.dto.SubscriptionConfigResponseDTO;
import status.zap.Application.subscription.dto.SubscriptionResponseDTO;
import status.zap.Application.subscription.service.SubscriptionService;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/config")
    public ResponseEntity<SubscriptionConfigResponseDTO> getConfig() {
        return ResponseEntity.ok(subscriptionService.getConfig());
    }

    @GetMapping("/me")
    public ResponseEntity<SubscriptionResponseDTO> getCurrentSubscription(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(subscriptionService.getCurrentSubscription(user.id()));
    }

    @PostMapping("/checkout")
    public ResponseEntity<SubscriptionCheckoutResponseDTO> startCheckout(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody(required = false) CreateSubscriptionCheckoutRequestDTO request) {
        CreateSubscriptionCheckoutRequestDTO payload = request == null
                ? new CreateSubscriptionCheckoutRequestDTO(null)
                : request;

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subscriptionService.startCheckout(user.id(), payload));
    }

    @PostMapping("/cancel")
    public ResponseEntity<SubscriptionResponseDTO> cancelCurrentSubscription(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(subscriptionService.cancelCurrentSubscription(user.id()));
    }
}
