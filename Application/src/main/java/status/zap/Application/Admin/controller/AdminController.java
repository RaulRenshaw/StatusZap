package status.zap.Application.Admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import status.zap.Application.Admin.dto.AdminAccountDTO;
import status.zap.Application.Admin.dto.AdminMetricsDTO;
import status.zap.Application.Admin.service.AdminService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")   // 403 automático para não-admins
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /** GET /admin/metrics */
    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsDTO> metrics() {
        return ResponseEntity.ok(adminService.getMetrics());
    }

    /** GET /admin/accounts */
    @GetMapping("/accounts")
    public ResponseEntity<List<AdminAccountDTO>> accounts() {
        return ResponseEntity.ok(adminService.getAccounts());
    }
}
