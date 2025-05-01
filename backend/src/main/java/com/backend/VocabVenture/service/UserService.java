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
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (!file.getContentType().startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setProfilePicture(file.getBytes());
        user.setProfilePictureContentType(file.getContentType());
        userRepository.save(user);

        return ProfilePictureResponse.builder()
                .message("Profile picture updated successfully")
                .imageUrl("/users/me/profile-picture")
                .build();
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
