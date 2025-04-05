package com.backend.VocabVenture.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Authentication request object for user login")
public class AuthRequest {
    @NotBlank(message = "Username is required")
    @Schema(description = "User's username", example = "johndoe", required = true)
    private String username;
    
    @NotBlank(message = "Password is required")
    @Schema(description = "User's password", example = "password123", required = true)
    private String password;
    
    // Getters and Setters
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
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
    
    public AuthRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }
    
    // Builder pattern
    public static AuthRequestBuilder builder() {
        return new AuthRequestBuilder();
    }
    
    // Builder class
    public static class AuthRequestBuilder {
        private String username;
        private String password;
        
        AuthRequestBuilder() {
        }
        
        public AuthRequestBuilder username(String username) {
            this.username = username;
            return this;
        }
        
        public AuthRequestBuilder password(String password) {
            this.password = password;
            return this;
        }
        
        public AuthRequest build() {
            return new AuthRequest(username, password);
        }
    }
}
