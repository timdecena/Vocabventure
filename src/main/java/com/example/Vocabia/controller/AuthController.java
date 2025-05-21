package com.example.Vocabia.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.Vocabia.entity.UserEntity;
import com.example.Vocabia.service.UserService;
import com.example.Vocabia.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserEntity user) {
        try {
            UserEntity saved = userService.registerUser(user);
            saved.setPassword(null); // don't return password
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        UserEntity user = userService.findByEmail(request.getEmail());
        if (user == null || !userService.getPasswordEncoder().matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(new LoginResponse(token, user.getRole()));
    }

    // Note: logout has no effect in JWT-based auth (no session), but you can still provide a route
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest req) {
        return ResponseEntity.ok("Logout successful (client must delete token)");
    }
}
