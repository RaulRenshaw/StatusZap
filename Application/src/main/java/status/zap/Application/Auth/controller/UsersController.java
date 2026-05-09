package status.zap.Application.Auth.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import status.zap.Application.Auth.dto.AuthResponseDTO;
import status.zap.Application.Auth.dto.LoginRequestDTO;
import status.zap.Application.Auth.dto.RegisterRequestDTO;
import status.zap.Application.Auth.service.UsersService;

@RestController
@RequestMapping("/api/auth")
public class UsersController {

    private final UsersService usersService;

    public UsersController(UsersService usersService) {
        this.usersService = usersService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usersService.register(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(usersService.login(dto));
    }

    /**
     * Logout: invalida token server-side (stub — pronto para blacklist).
     * O front limpa localStorage independente da resposta.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader("Authorization") String authorizationHeader) {
        // Extrai o token puro, removendo o prefixo "Bearer "
        String token = authorizationHeader.startsWith("Bearer ")
                ? authorizationHeader.substring(7)
                : authorizationHeader;
        usersService.logout(token);
        return ResponseEntity.noContent().build(); // 204
    }
}