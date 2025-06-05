package com.example.Vocabia.controller;

import com.example.Vocabia.dto.LoginRequest;
import com.example.Vocabia.dto.LoginResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Vocabia.entity.User;
import com.example.Vocabia.service.UserService;
import com.example.Vocabia.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor; // <-- Lombok import

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor // <-- Lombok annotation for constructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User saved = userService.registerUser(user);
            saved.setPassword(null); // don't return password
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.findByEmail(request.getEmail());
            if (user == null || !userService.getPasswordEncoder().matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.status(401).body("Invalid email or password");
            }
            String token = jwtUtil.generateToken(user.getEmail());
            return ResponseEntity.ok(new LoginResponse(token, user.getRole()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest req) {
        return ResponseEntity.ok("Logout successful (client must delete token)");
    }

    @GetMapping("/profile")
public ResponseEntity<?> getProfile(HttpServletRequest request) {
    String email = jwtUtil.extractUsernameFromRequest(request);
    if (email == null) {
        return ResponseEntity.status(403).body("Invalid or missing token");
    }

    User user = userService.findByEmail(email);
    if (user == null) {
        return ResponseEntity.status(404).body("User not found");
    }

    user.setPassword(null); // Hide password
    return ResponseEntity.ok(user);
}

}
