package com.example.Vocabia.adventure.service;

import com.example.Vocabia.adventure.entity.AdventureProfile;
import com.example.Vocabia.adventure.repository.AdventureProfileRepository;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdventureProfileService {

    private final AdventureProfileRepository profileRepo;
    private final UserRepository userRepo;

    public AdventureProfileService(AdventureProfileRepository profileRepo, UserRepository userRepo) {
        this.profileRepo = profileRepo;
        this.userRepo = userRepo;
    }

    public AdventureProfile getOrCreateProfile(String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        return profileRepo.findByUser(user).orElseGet(() -> {
            AdventureProfile newProfile = new AdventureProfile();
            newProfile.setUser(user);
            newProfile.setXp(0);
            newProfile.setLevel(1);
            return profileRepo.save(newProfile);
        });
    }

    public void completeTutorial(String email) {
        AdventureProfile profile = getOrCreateProfile(email);
        profile.setTutorialCompleted(true);
        profileRepo.save(profile);
    }

    /**
     * Unlock FPOW levels based on Adventure Mode progress
     * Mapping: Jungle Lush Level -> Unlocked FPOW Levels
     * Level 1 -> Unlocks FPOW 1, 2 (JUNGLE, COMMA)
     * Level 2 -> Unlocks FPOW 3, 4 (TENSE, TIMELINE)
     * Level 3 -> Unlocks FPOW 5, 6 (PLURAL, ACADEMY)
     * Level 4 -> Unlocks FPOW 7, 8 (TOWER, RECKONING)
     * Level 5 -> Unlocks FPOW 9, 10 (GRAMMOWL, PROPHECY)
     */
    @Transactional
    public void unlockFpowLevelsForAdventureLevel(String email, int adventureLevel) {
        AdventureProfile profile = getOrCreateProfile(email);
        
        // Determine which FPOW levels to unlock based on adventure level
        Set<Integer> levelsToUnlock = new HashSet<>();
        switch (adventureLevel) {
            case 1:
                levelsToUnlock.add(1); // JUNGLE
                levelsToUnlock.add(2); // COMMA
                break;
            case 2:
                levelsToUnlock.add(3); // TENSE
                levelsToUnlock.add(4); // TIMELINE
                break;
            case 3:
                levelsToUnlock.add(5); // PLURAL
                levelsToUnlock.add(6); // ACADEMY
                break;
            case 4:
                levelsToUnlock.add(7); // TOWER
                levelsToUnlock.add(8); // RECKONING
                break;
            case 5:
                levelsToUnlock.add(9);  // GRAMMOWL
                levelsToUnlock.add(10); // PROPHECY
                break;
        }
        
        // Get currently unlocked levels
        Set<Integer> currentlyUnlocked = parseUnlockedLevels(profile.getUnlockedFpowLevels());
        
        // Add new unlocks
        currentlyUnlocked.addAll(levelsToUnlock);
        
        // Save back as comma-separated string
        String updated = currentlyUnlocked.stream()
                .sorted()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        
        profile.setUnlockedFpowLevels(updated);
        profileRepo.save(profile);
    }

    /**
     * Get all unlocked FPOW levels for a user
     */
    public Set<Integer> getUnlockedFpowLevels(String email) {
        AdventureProfile profile = getOrCreateProfile(email);
        return parseUnlockedLevels(profile.getUnlockedFpowLevels());
    }

    /**
     * Check if a specific FPOW level is unlocked
     */
    public boolean isFpowLevelUnlocked(String email, int level) {
        return getUnlockedFpowLevels(email).contains(level);
    }

    /**
     * Helper method to parse comma-separated level string
     */
    private Set<Integer> parseUnlockedLevels(String unlockedStr) {
        if (unlockedStr == null || unlockedStr.trim().isEmpty()) {
            return new HashSet<>();
        }
        return Arrays.stream(unlockedStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Integer::parseInt)
                .collect(Collectors.toSet());
    }
}
