package com.backend.VocabVenture.service;

import com.backend.VocabVenture.dto.ProfilePictureResponse;
import com.backend.VocabVenture.dto.UserDTO;
import com.backend.VocabVenture.exception.ResourceNotFoundException;
import com.backend.VocabVenture.model.User;
import com.backend.VocabVenture.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

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

    /**
     * Add experience points to a user and handle level ups
     * @param userId The user ID
     * @param xpPoints The amount of XP to add
     * @return A map containing the updated XP, level, and whether the user leveled up
     */
    @Transactional
    public Map<String, Object> addExperiencePoints(Long userId, Integer xpPoints) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Get current XP and level
        Integer currentXp = user.getExperiencePoints();
        Integer currentLevel = user.getUserLevel();
        
        // Add XP
        Integer newXp = currentXp + xpPoints;
        user.setExperiencePoints(newXp);
        
        // Check if user should level up
        boolean leveledUp = false;
        Integer newLevel = calculateLevel(newXp);
        
        if (newLevel > currentLevel) {
            user.setUserLevel(newLevel);
            leveledUp = true;
        }
        
        // Save user
        userRepository.save(user);
        
        // Return updated info
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("previousXp", currentXp);
        result.put("currentXp", newXp);
        result.put("xpGained", xpPoints);
        result.put("previousLevel", currentLevel);
        result.put("currentLevel", newLevel);
        result.put("leveledUp", leveledUp);
        result.put("nextLevelXp", getXpRequiredForNextLevel(newLevel));
        
        return result;
    }
    
    /**
     * Calculate the level based on XP
     * Formula: Level = 1 + floor(sqrt(XP / 10))
     */
    private Integer calculateLevel(Integer xp) {
        return 1 + (int) Math.floor(Math.sqrt(xp / 10.0));
    }
    
    /**
     * Get the XP required for the next level
     */
    private Integer getXpRequiredForNextLevel(Integer currentLevel) {
        // The formula is: XP = (level)² * 10
        return (int) (Math.pow(currentLevel + 1, 2) * 10);
    }
    
    /**
     * Get user XP and level information
     */
    public Map<String, Object> getUserXpInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        Integer currentXp = user.getExperiencePoints();
        Integer currentLevel = user.getUserLevel();
        Integer nextLevelXp = getXpRequiredForNextLevel(currentLevel);
        
        Map<String, Object> xpInfo = new HashMap<>();
        xpInfo.put("userId", userId);
        xpInfo.put("username", user.getUsername());
        xpInfo.put("currentXp", currentXp);
        xpInfo.put("currentLevel", currentLevel);
        xpInfo.put("nextLevelXp", nextLevelXp);
        xpInfo.put("xpToNextLevel", nextLevelXp - currentXp);
        xpInfo.put("xpPercentage", calculateXpPercentage(currentXp, currentLevel));
        
        return xpInfo;
    }
    
    /**
     * Calculate the percentage of XP progress to the next level
     */
    private Double calculateXpPercentage(Integer currentXp, Integer currentLevel) {
        Integer currentLevelXp = (int) (Math.pow(currentLevel, 2) * 10);
        Integer nextLevelXp = (int) (Math.pow(currentLevel + 1, 2) * 10);
        Integer xpInCurrentLevel = currentXp - currentLevelXp;
        Integer xpRequiredForNextLevel = nextLevelXp - currentLevelXp;
        
        return (double) xpInCurrentLevel / xpRequiredForNextLevel * 100;
    }
    
    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .hasProfilePicture(user.getProfilePicture() != null)
                .experiencePoints(user.getExperiencePoints())
                .userLevel(user.getUserLevel())
                .build();
    }
}
