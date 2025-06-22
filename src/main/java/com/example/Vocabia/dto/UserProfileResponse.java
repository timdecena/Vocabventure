package com.example.Vocabia.dto;

import lombok.Data;

@Data
public class UserProfileResponse {
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private Integer gold;
    private String profileImageBase64; // Base64-encoded string for the frontend
}
