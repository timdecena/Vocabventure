package com.example.Vocabia.controller;

import com.example.Vocabia.dto.UserProfileResponse;
import com.example.Vocabia.dto.UserProfileUpdateRequest;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.service.UserService;
import com.example.Vocabia.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserProfileController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(HttpServletRequest request) {
        String email = jwtUtil.extractUsernameFromRequest(request);
        return userService.findByEmail(email)
                .map(userService::toProfileResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).build());
    }

    @PostMapping("/profile-image")
    public ResponseEntity<UserProfileResponse> uploadProfileImage(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        String email = jwtUtil.extractUsernameFromRequest(request);
        // --- File size and type validation ---
        if (file.getSize() > 1024 * 1024) { // 1MB
            throw new IllegalArgumentException("File too large");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Invalid file type");
        }
        byte[] bytes = file.getBytes();
        return ResponseEntity.ok(userService.updateProfileImage(email, bytes));
    }
    
    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(
            HttpServletRequest request,
            @RequestBody UserProfileUpdateRequest profileUpdateRequest
    ) {
        String email = jwtUtil.extractUsernameFromRequest(request);
        return ResponseEntity.ok(userService.updateProfile(email, profileUpdateRequest));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            HttpServletRequest request,
            @RequestBody com.example.Vocabia.dto.ChangePasswordRequest changePasswordRequest
    ) {
        String email = jwtUtil.extractUsernameFromRequest(request);
        try {
            userService.changePassword(email, changePasswordRequest.getCurrentPassword(), changePasswordRequest.getNewPassword());
            return ResponseEntity.ok().body("Password changed successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}
