package com.backend.VocabVenture.service;

import com.backend.VocabVenture.dto.ProfilePictureResponse;
import com.backend.VocabVenture.dto.UserDTO;
import com.backend.VocabVenture.model.User;
import com.backend.VocabVenture.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToDTO(user);
    }
    
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public byte[] getProfilePicture(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getProfilePicture();
    }

    public String getProfilePictureContentType(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getProfilePictureContentType();
    }

    public ProfilePictureResponse updateProfilePicture(String username, MultipartFile file) throws IOException {
        if (file == null) {
            throw new RuntimeException("No file was provided");
        }
        
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        // Check file size (limit to 2MB as per application.properties)
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds the 2MB limit");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            byte[] imageBytes = file.getBytes();
            user.setProfilePicture(imageBytes);
            user.setProfilePictureContentType(contentType);
            userRepository.save(user);
            
            return ProfilePictureResponse.builder()
                    .message("Profile picture updated successfully")
                    .imageUrl("/users/me/profile-picture")
                    .build();
        } catch (IOException e) {
            throw new IOException("Failed to process the image file: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Error saving profile picture: " + e.getMessage(), e);
        }
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .hasProfilePicture(user.getProfilePicture() != null)
                .build();
    }
}
