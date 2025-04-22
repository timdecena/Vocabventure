package com.backend.VocabVenture.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response object for profile picture operations")
public class ProfilePictureResponse {
    @Schema(description = "Response message", example = "Profile picture updated successfully")
    private String message;

    @Schema(description = "URL to access the profile picture", example = "/users/me/profile-picture")
    private String imageUrl;

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    // Builder pattern
    public static ProfilePictureResponseBuilder builder() {
        return new ProfilePictureResponseBuilder();
    }

    // Builder class
    public static class ProfilePictureResponseBuilder {
        private String message;
        private String imageUrl;

        ProfilePictureResponseBuilder() {
        }

        public ProfilePictureResponseBuilder message(String message) {
            this.message = message;
            return this;
        }

        public ProfilePictureResponseBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public ProfilePictureResponse build() {
            return new ProfilePictureResponse(message, imageUrl);
        }
    }

    // Constructors
    public ProfilePictureResponse() {
    }

    public ProfilePictureResponse(String message, String imageUrl) {
        this.message = message;
        this.imageUrl = imageUrl;
    }
}