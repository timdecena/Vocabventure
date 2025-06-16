package com.example.Vocabia.adventure.service;

import com.example.Vocabia.adventure.entity.AdventureProfile;
import com.example.Vocabia.adventure.repository.AdventureProfileRepository;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.entity.User;
import org.springframework.stereotype.Service;

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
}
