package com.backend.VocabVenture.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
public class User implements UserDetails {
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

    @Lob
    @Column(name = "profile_picture", columnDefinition = "LONGBLOB")
    private byte[] profilePicture;

    @Column(name = "profile_picture_content_type")
    private String profilePictureContentType;
    
    // XP and level for gamification
    @Column(name = "experience_points", columnDefinition = "INT DEFAULT 0")
    private Integer experiencePoints = 0;
    
    @Column(name = "user_level", columnDefinition = "INT DEFAULT 1")
    private Integer userLevel = 1;

    // UserDetails interface methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Override
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

    @Override
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

    public byte[] getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(byte[] profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getProfilePictureContentType() {
        return profilePictureContentType;
    }

    public void setProfilePictureContentType(String profilePictureContentType) {
        this.profilePictureContentType = profilePictureContentType;
    }
    
    public Integer getExperiencePoints() {
        return experiencePoints;
    }
    
    public void setExperiencePoints(Integer experiencePoints) {
        this.experiencePoints = experiencePoints;
    }
    
    public Integer getUserLevel() {
        return userLevel;
    }
    
    public void setUserLevel(Integer userLevel) {
        this.userLevel = userLevel;
    }

    // Builder pattern
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    // NoArgsConstructor
    public User() {
    }

    // AllArgsConstructor
    public User(Long id, String username, String email, String password, Role role,
                byte[] profilePicture, String profilePictureContentType,
                Integer experiencePoints, Integer userLevel) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.profilePicture = profilePicture;
        this.profilePictureContentType = profilePictureContentType;
        this.experiencePoints = experiencePoints != null ? experiencePoints : 0;
        this.userLevel = userLevel != null ? userLevel : 1;
    }

    // Builder class
    public static class UserBuilder {
        private Long id;
        private String username;
        private String email;
        private String password;
        private Role role;
        private byte[] profilePicture;
        private String profilePictureContentType;
        private Integer experiencePoints;
        private Integer userLevel;

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

        public UserBuilder profilePicture(byte[] profilePicture) {
            this.profilePicture = profilePicture;
            return this;
        }

        public UserBuilder profilePictureContentType(String profilePictureContentType) {
            this.profilePictureContentType = profilePictureContentType;
            return this;
        }
        
        public UserBuilder experiencePoints(Integer experiencePoints) {
            this.experiencePoints = experiencePoints;
            return this;
        }
        
        public UserBuilder userLevel(Integer userLevel) {
            this.userLevel = userLevel;
            return this;
        }

        public User build() {
            return new User(id, username, email, password, role, profilePicture, profilePictureContentType, experiencePoints, userLevel);
        }
    }
}