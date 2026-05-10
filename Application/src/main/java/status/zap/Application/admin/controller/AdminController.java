package status.zap.Application.admin.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import status.zap.Application.admin.dto.AdminAccountDTO;
import status.zap.Application.admin.dto.AdminMetricsDTO;
import status.zap.Application.admin.service.AdminService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsDTO> metrics() {
        return ResponseEntity.ok(adminService.getMetrics());
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<AdminAccountDTO>> accounts() {
        return ResponseEntity.ok(adminService.getAccounts());
    }
}
