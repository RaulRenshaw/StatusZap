package status.zap.Application.Profile.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import status.zap.Application.Auth.dto.AuthenticatedUser;
import status.zap.Application.Auth.model.UsersEntity;
import status.zap.Application.Auth.repository.UsersRepository;
import status.zap.Application.Profile.dto.ProfileRequestDTO;
import status.zap.Application.Profile.dto.ProfileResponseDTO;
import status.zap.Application.Profile.service.ProfileService;
import status.zap.Application.commons.exception.ResourceNotFoundException;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final UsersRepository usersRepository;

    public ProfileController(ProfileService profileService,
                             UsersRepository usersRepository) {
        this.profileService = profileService;
        this.usersRepository = usersRepository;
    }

    /** GET /profile — perfil do usuário autenticado */
    @GetMapping()
    public ResponseEntity<ProfileResponseDTO> getProfile(
            @AuthenticationPrincipal AuthenticatedUser userDetails) {
        return ResponseEntity.ok(profileService.getProfile(userDetails.id()));
    }

    /** PUT /profile — cria ou atualiza perfil */
    @PutMapping()
    public ResponseEntity<ProfileResponseDTO> saveProfile(
            @AuthenticationPrincipal AuthenticatedUser userDetails,
            @Valid @RequestBody ProfileRequestDTO dto) {
        return ResponseEntity.ok(profileService.saveProfile(userDetails.id(), dto));
    }

    /** POST /profile/logo — upload multipart da logo */
    @PostMapping("/profile/logo")
    public ResponseEntity<Map<String, String>> uploadLogo(
            @AuthenticationPrincipal AuthenticatedUser userDetails,
            @RequestParam("file") MultipartFile file) {
        String logoUrl = profileService.uploadLogo(userDetails.id(), file);
        return ResponseEntity.ok(Map.of("logoUrl", logoUrl));
    }

    /** GET /public/profile/:slug — acesso público, sem auth */
    @GetMapping("/public/{slug}")
    public ResponseEntity<ProfileResponseDTO> getPublicProfile(@PathVariable String slug) {
        return ResponseEntity.ok(profileService.getPublicProfile(slug));
    }

    // -------------------------------------------------------------------------

}