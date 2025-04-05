package com.backend.VocabVenture.dto;

import com.backend.VocabVenture.model.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

@Schema(description = "Request object for user registration")
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    @Length(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    @Schema(description = "User's username", example = "johndoe", required = true)
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Schema(description = "User's email address", example = "john.doe@example.com", required = true)
    private String email;
    
    @NotBlank(message = "Password is required")
    @Length(min = 6, max = 20, message = "Password must be between 6 and 20 characters")
    @Schema(description = "User's password", example = "password123", required = true, minLength = 6, maxLength = 20)
    private String password;
    
    @Schema(description = "User's role (STUDENT or TEACHER)", example = "STUDENT", required = false)
    private Role role;
    
    // Getters and Setters
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
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
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    // Constructors
    public RegisterRequest() {
    }
    
    public RegisterRequest(String username, String email, String password, Role role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }
    
    // Builder pattern
    public static RegisterRequestBuilder builder() {
        return new RegisterRequestBuilder();
    }
    
    // Builder class
    public static class RegisterRequestBuilder {
        private String username;
        private String email;
        private String password;
        private Role role;
        
        RegisterRequestBuilder() {
        }
        
        public RegisterRequestBuilder username(String username) {
            this.username = username;
            return this;
        }
        
        public RegisterRequestBuilder email(String email) {
            this.email = email;
            return this;
        }
        
        public RegisterRequestBuilder password(String password) {
            this.password = password;
            return this;
        }
        
        public RegisterRequestBuilder role(Role role) {
            this.role = role;
            return this;
        }
        
        public RegisterRequest build() {
            return new RegisterRequest(username, email, password, role);
        }
    }
}
