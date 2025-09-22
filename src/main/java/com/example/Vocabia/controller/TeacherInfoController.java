package com.example.Vocabia.controller;

import com.example.Vocabia.dto.TeacherInfoDTO;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.service.UserService;
import com.example.Vocabia.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Base64;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class TeacherInfoController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @GetMapping("/info")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> getTeacherInfo(HttpServletRequest request) {
        String email = jwtUtil.extractUsernameFromRequest(request);
        if (email == null) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        User user = userService.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }
        if (!"TEACHER".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(403).body("Not a teacher");
        }

        String avatar = null;
        if (user.getProfileImage() != null) {
            String base64 = Base64.getEncoder().encodeToString(user.getProfileImage());
            avatar = "data:image/png;base64," + base64;
        }

        TeacherInfoDTO dto = new TeacherInfoDTO(
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                avatar
        );
        return ResponseEntity.ok(dto);
    }
}
