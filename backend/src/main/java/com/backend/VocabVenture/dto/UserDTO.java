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

    @Schema(description = "Indicates if user has a profile picture", example = "true")
    private boolean hasProfilePicture;
    
    @Schema(description = "User experience points", example = "150")
    private Integer experiencePoints;
    
    @Schema(description = "User level", example = "5")
    private Integer userLevel;

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

    public boolean isHasProfilePicture() {
        return hasProfilePicture;
    }

    public void setHasProfilePicture(boolean hasProfilePicture) {
        this.hasProfilePicture = hasProfilePicture;
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

    // Constructors
    public UserDTO() {
    }

    public UserDTO(Long id, String username, String email, Role role, boolean hasProfilePicture,
                 Integer experiencePoints, Integer userLevel) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.hasProfilePicture = hasProfilePicture;
        this.experiencePoints = experiencePoints;
        this.userLevel = userLevel;
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
        private boolean hasProfilePicture;
        private Integer experiencePoints;
        private Integer userLevel;

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

        public UserDTOBuilder hasProfilePicture(boolean hasProfilePicture) {
            this.hasProfilePicture = hasProfilePicture;
            return this;
        }
        
        public UserDTOBuilder experiencePoints(Integer experiencePoints) {
            this.experiencePoints = experiencePoints;
            return this;
        }
        
        public UserDTOBuilder userLevel(Integer userLevel) {
            this.userLevel = userLevel;
            return this;
        }

        public UserDTO build() {
            return new UserDTO(id, username, email, role, hasProfilePicture, experiencePoints, userLevel);
        }
    }
}