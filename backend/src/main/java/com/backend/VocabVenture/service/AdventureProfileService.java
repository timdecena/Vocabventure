package com.backend.VocabVenture.service;

import com.backend.VocabVenture.model.AdventureProfile;
import com.backend.VocabVenture.model.User;
import com.backend.VocabVenture.repository.AdventureProfileRepository;
import com.backend.VocabVenture.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AdventureProfileService {

    private final AdventureProfileRepository adventureProfileRepository;
    private final UserRepository userRepository;

    @Autowired
    public AdventureProfileService(
            AdventureProfileRepository adventureProfileRepository,
            UserRepository userRepository) {
        this.adventureProfileRepository = adventureProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AdventureProfile createProfile(String adventurerName, String gender, Long userId) {
        // Check if user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Check if profile already exists
        if (adventureProfileRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Profile already exists for this user");
        }

        AdventureProfile profile = new AdventureProfile();
        profile.setAdventurerName(adventurerName);
        profile.setGender(gender);
        profile.setUserId(userId);
        profile.setCurrentIsland(1);
        profile.setStarsEarned(0);
        profile.setScrollsCollected(0);
        profile.setHearts(3);

        return adventureProfileRepository.save(profile);
    }

    public Optional<AdventureProfile> getProfileByUserId(Long userId) {
        return adventureProfileRepository.findByUserId(userId);
    }

    @Transactional
    public AdventureProfile updateProfile(AdventureProfile profile) {
        return adventureProfileRepository.save(profile);
    }
} 