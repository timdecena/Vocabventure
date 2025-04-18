package com.backend.VocabVenture.dto;

import com.backend.VocabVenture.model.Role;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User data transfer object containing user information")
public class UserDTO {
    @Schema(description = "User ID", example = "1")
    private Long id;
    
    @Schema(description = "Username", example = "johndoe")
    private String username;
    
    @Schema(description = "Email address", example = "john.doe@example.com")
    private String email;
    
    @Schema(description = "User role", example = "STUDENT")
    private Role role;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    // Constructors
    public UserDTO() {
    }
    
    public UserDTO(Long id, String username, String email, Role role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }
    
    // Builder pattern
    public static UserDTOBuilder builder() {
        return new UserDTOBuilder();
    }
    
    // Builder class
    public static class UserDTOBuilder {
        private Long id;
        private String username;
        private String email;
        private Role role;
        
        UserDTOBuilder() {
        }
        
        public UserDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }
        
        public UserDTOBuilder username(String username) {
            this.username = username;
            return this;
        }
        
        public UserDTOBuilder email(String email) {
            this.email = email;
            return this;
        }
        
        public UserDTOBuilder role(Role role) {
            this.role = role;
            return this;
        }
        
        public UserDTO build() {
            return new UserDTO(id, username, email, role);
        }
    }
}
