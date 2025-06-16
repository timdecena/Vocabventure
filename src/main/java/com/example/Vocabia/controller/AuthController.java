package com.example.Vocabia.controller;

import com.example.Vocabia.dto.LoginRequest;
import com.example.Vocabia.dto.LoginResponse;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.service.UserService;
import com.example.Vocabia.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User saved = userService.registerUser(user);
            saved.setPassword(null); // hide password
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.findByEmail(request.getEmail()).orElse(null);
            if (user == null || !userService.checkPassword(user, request.getPassword())) {
                return ResponseEntity.status(401).body("Invalid email or password");
            }
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
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

        Optional<User> userOpt = userService.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            if (token == null) {
                return ResponseEntity.badRequest().body("No token provided");
            }

            String email = jwtUtil.extractEmail(token);
            String authority = jwtUtil.extractAuthority(token);
            if (email == null) {
                return ResponseEntity.status(401).body("Invalid token");
            }

            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("User not found");
            }

            User user = userOpt.get();
            String expectedAuthority = "ROLE_" + user.getRole().toUpperCase();

            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("email", email);
            response.put("role", user.getRole());
            response.put("tokenAuthority", authority);
            response.put("expectedAuthority", expectedAuthority);
            response.put("authorityMatch", expectedAuthority.equals(authority));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error validating token: " + e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            if (token == null) {
                return ResponseEntity.badRequest().body("No token provided");
            }

            String email = jwtUtil.extractEmail(token);
            if (email == null) {
                return ResponseEntity.status(401).body("Invalid token");
            }

            Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(401).body("User not found");
            }

            User user = userOpt.get();
            String newToken = jwtUtil.generateToken(user.getEmail(), user.getRole());

            Map<String, Object> response = new HashMap<>();
            response.put("token", newToken);
            response.put("role", user.getRole());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error refreshing token: " + e.getMessage());
        }
    }
}
