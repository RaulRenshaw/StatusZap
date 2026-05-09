package status.zap.Application.Admin.service;

import org.springframework.stereotype.Service;
import status.zap.Application.Admin.dto.AdminAccountDTO;
import status.zap.Application.Admin.dto.AdminMetricsDTO;
import status.zap.Application.Auth.model.UsersEntity;
import status.zap.Application.Auth.repository.UsersRepository;
import status.zap.Application.Service.repository.ServiceRepository;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AdminService {

    private final UsersRepository usersRepository;
    private final ServiceRepository serviceRepository;

    public AdminService(UsersRepository usersRepository,
                        ServiceRepository serviceRepository) {
        this.usersRepository = usersRepository;
        this.serviceRepository = serviceRepository;
    }

    public AdminMetricsDTO getMetrics() {
        long totalAccounts   = usersRepository.count();
        long totalServices   = serviceRepository.count();
        long last30Days      = serviceRepository.countCreatedAfter(
                Instant.now().minus(30, ChronoUnit.DAYS));
        long activeAccounts  = usersRepository.countWithAtLeastOneService();

        return new AdminMetricsDTO(totalAccounts, totalServices, last30Days, activeAccounts);
    }

    public List<AdminAccountDTO> getAccounts() {
        return usersRepository.findAll().stream()
                .map(u -> new AdminAccountDTO(
                        u.getId(),
                        u.getEmail(),
                        u.getShopName(),
                        u.getRoles().name().toLowerCase(),
                        serviceRepository.countByUserId(u.getId())
                ))
                .toList();
    }
}
