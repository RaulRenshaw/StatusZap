package status.zap.Application.profile.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import status.zap.Application.auth.dto.AuthenticatedUser;
import status.zap.Application.profile.dto.ProfileRequestDTO;
import status.zap.Application.profile.dto.ProfileResponseDTO;
import status.zap.Application.profile.service.ProfileService;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /** GET /api/profile */
    @GetMapping
    public ResponseEntity<ProfileResponseDTO> getProfile(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(profileService.getProfile(user.id()));
    }

    /** PUT /api/profile */
    @PutMapping("/update")
    public ResponseEntity<ProfileResponseDTO> saveProfile(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody ProfileRequestDTO dto) {
        return ResponseEntity.ok(profileService.saveProfile(user.id(), dto));
    }

    /** POST /api/profile/logo */
    @PostMapping("/logo")
    public ResponseEntity<Map<String, String>> uploadLogo(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam("file") MultipartFile file) {
        String logoUrl = profileService.uploadLogo(user.id(), file);
        return ResponseEntity.ok(Map.of("logoUrl", logoUrl));
    }

    /** GET /api/public/profile/:slug — sem auth */
    @GetMapping("/public/{slug}")
    public ResponseEntity<ProfileResponseDTO> getPublicProfile(
            @PathVariable String slug) {
        return ResponseEntity.ok(profileService.getPublicProfile(slug));
    }
}
