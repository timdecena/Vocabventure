package com.backend.VocabVenture.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authentication response containing JWT token and user information")
public class AuthResponse {
    @Schema(description = "JWT token for authentication", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;
    
    @Schema(description = "User information")
    private UserDTO user;
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public UserDTO getUser() {
        return user;
    }
    
    public void setUser(UserDTO user) {
        this.user = user;
    }
    
    // Constructors
    public AuthResponse() {
    }
    
    public AuthResponse(String token, UserDTO user) {
        this.token = token;
        this.user = user;
    }
    
    // Builder pattern
    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }
    
    // Builder class
    public static class AuthResponseBuilder {
        private String token;
        private UserDTO user;
        
        AuthResponseBuilder() {
        }
        
        public AuthResponseBuilder token(String token) {
            this.token = token;
            return this;
        }
        
        public AuthResponseBuilder user(UserDTO user) {
            this.user = user;
            return this;
        }
        
        public AuthResponse build() {
            return new AuthResponse(token, user);
        }
    }
}
