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
        System.out.println("AuthController - Register attempt for email: " + user.getEmail());
        try {
            UserEntity saved = userService.registerUser(user);
            saved.setPassword(null); // don't return password
            System.out.println("AuthController - Registration successful for: " + user.getEmail());
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            System.out.println("AuthController - Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("AuthController - Login attempt for email: " + request.getEmail());
        
        try {
            UserEntity user = userService.findByEmail(request.getEmail());
            if (user == null) {
                System.out.println("AuthController - User not found: " + request.getEmail());
                return ResponseEntity.status(401).body("Invalid email or password");
            }
            
            boolean passwordMatches = userService.getPasswordEncoder().matches(request.getPassword(), user.getPassword());
            System.out.println("AuthController - Password matches: " + passwordMatches);
            
            if (!passwordMatches) {
                System.out.println("AuthController - Password mismatch for: " + request.getEmail());
                return ResponseEntity.status(401).body("Invalid email or password");
            }

            String token = jwtUtil.generateToken(user.getEmail());
            System.out.println("AuthController - Login successful for: " + request.getEmail() + ", role: " + user.getRole());
            return ResponseEntity.ok(new LoginResponse(token, user.getRole()));
            
        } catch (Exception e) {
            System.out.println("AuthController - Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Internal server error");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest req) {
        System.out.println("AuthController - Logout request received");
        return ResponseEntity.ok("Logout successful (client must delete token)");
    }
}