package com.backend.VocabVenture.security;

import com.backend.VocabVenture.dto.AuthRequest;
import com.backend.VocabVenture.dto.AuthResponse;
import com.backend.VocabVenture.dto.RegisterRequest;
import com.backend.VocabVenture.dto.UserDTO;
import com.backend.VocabVenture.exception.CustomException;
import com.backend.VocabVenture.model.Role;
import com.backend.VocabVenture.model.User;
import com.backend.VocabVenture.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.backend.VocabVenture.security.JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new CustomException("Username is already taken", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email is already in use", HttpStatus.BAD_REQUEST);
        }
        
        // Use the role from the request or default to STUDENT
        Role role = request.getRole() != null ? request.getRole() : Role.STUDENT;
        
        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();
        userRepository.save(user);
        
        // Create UserDetails for token generation
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(), 
                user.getPassword(), 
                Collections.singletonList(
                        new SimpleGrantedAuthority(user.getRole().name())
                )
        );
        
        var jwtToken = jwtUtils.generateToken(userDetails);
        
        // Map User to UserDTO for response
        UserDTO userDTO = UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
                
        return AuthResponse.builder()
                .token(jwtToken)
                .user(userDTO)
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        try {
            // Find user by email first
            var user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new CustomException("User not found with this email", HttpStatus.NOT_FOUND));
            
            // Then authenticate with username and password
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new CustomException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
        
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));
        
        // Create UserDetails for token generation
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(), 
                user.getPassword(), 
                Collections.singletonList(
                        new SimpleGrantedAuthority(user.getRole().name())
                )
        );
        
        var jwtToken = jwtUtils.generateToken(userDetails);
        
        // Map User to UserDTO for response
        UserDTO userDTO = UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
                
        return AuthResponse.builder()
                .token(jwtToken)
                .user(userDTO)
                .build();
    }
}
