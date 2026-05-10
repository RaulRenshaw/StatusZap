package status.zap.Application.order.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import status.zap.Application.auth.dto.AuthenticatedUser;
import status.zap.Application.order.dto.*;
import status.zap.Application.order.service.OrderService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /** GET /api/orders */
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> list(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(orderService.listByUser(user.id()));
    }

    /** GET /api/orders/:id */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(orderService.getById(id, user.id()));
    }

    /** POST /api/orders */
    @PostMapping
    public ResponseEntity<OrderResponseDTO> create(
            @Valid @RequestBody CreateOrderRequestDTO dto,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.create(dto, user.id()));
    }

    /** PATCH /api/orders/:id */
    @PatchMapping("/{id}")
    public ResponseEntity<OrderResponseDTO> update(
            @PathVariable UUID id,
            @RequestBody UpdateOrderRequestDTO dto,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(orderService.update(id, dto, user.id()));
    }

    /** PATCH /api/orders/:id/status */
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponseDTO> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequestDTO dto,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(orderService.updateStatus(id, dto, user.id()));
    }

    /** DELETE /api/orders/:id */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        orderService.delete(id, user.id());
        return ResponseEntity.noContent().build();
    }
}
