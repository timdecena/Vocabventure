package com.backend.VocabVenture.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Authentication request object for user login")
public class AuthRequest {
    @NotBlank(message = "Email is required")
    @Schema(description = "User's email", example = "johndoe@example.com", required = true)
    private String email;
    
    @NotBlank(message = "Password is required")
    @Schema(description = "User's password", example = "password123", required = true)
    private String password;
    
    // Getters and Setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    // Constructors
    public AuthRequest() {
    }
    
    public AuthRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }
    
    // Builder pattern
    public static AuthRequestBuilder builder() {
        return new AuthRequestBuilder();
    }
    
    // Builder class
    public static class AuthRequestBuilder {
        private String email;
        private String password;
        
        AuthRequestBuilder() {
        }
        
        public AuthRequestBuilder email(String email) {
            this.email = email;
            return this;
        }
        
        public AuthRequestBuilder password(String password) {
            this.password = password;
            return this;
        }
        
        public AuthRequest build() {
            return new AuthRequest(email, password);
        }
    }
}
