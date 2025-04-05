package com.backend.VocabVenture.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Length(max = 20)
    private String username;

    @NotBlank
    @Email
    @Length(max = 50)
    private String email;

    @NotBlank
    @Length(max = 120)
    private String password;

    @Enumerated(EnumType.STRING)
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
    
    // Builder pattern
    public static UserBuilder builder() {
        return new UserBuilder();
    }
    
    // NoArgsConstructor
    public User() {
    }
    
    // AllArgsConstructor
    public User(Long id, String username, String email, String password, Role role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }
    
    // Builder class
    public static class UserBuilder {
        private Long id;
        private String username;
        private String email;
        private String password;
        private Role role;
        
        UserBuilder() {
        }
        
        public UserBuilder id(Long id) {
            this.id = id;
            return this;
        }
        
        public UserBuilder username(String username) {
            this.username = username;
            return this;
        }
        
        public UserBuilder email(String email) {
            this.email = email;
            return this;
        }
        
        public UserBuilder password(String password) {
            this.password = password;
            return this;
        }
        
        public UserBuilder role(Role role) {
            this.role = role;
            return this;
        }
        
        public User build() {
            return new User(id, username, email, password, role);
        }
    }
}
