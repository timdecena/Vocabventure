package com.backend.VocabVenture.service;

import com.backend.VocabVenture.model.AdventureProfile;
import com.backend.VocabVenture.model.AdventureLevelStats;
import com.backend.VocabVenture.repository.AdventureProfileRepository;
import com.backend.VocabVenture.repository.AdventureLevelStatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdventureProgressService {
    @Autowired
    private AdventureProfileRepository profileRepo;
    @Autowired
    private AdventureLevelStatsRepository levelStatsRepo;

    public Optional<AdventureProfile> getProfileByUserId(Long userId) {
        return profileRepo.findByUserId(userId);
    }

    public AdventureProfile saveProfile(AdventureProfile profile) {
        return profileRepo.save(profile);
    }

    public List<AdventureLevelStats> getLevelStatsByUserId(Long userId) {
        return levelStatsRepo.findByUserId(userId);
    }

    public Optional<AdventureLevelStats> getLevelStats(Long userId, Long levelId) {
        return levelStatsRepo.findByUserIdAndLevelId(userId, levelId);
    }

    // Upsert: update if exists, else insert
    public AdventureLevelStats saveLevelStats(AdventureLevelStats stats) {
        Optional<AdventureLevelStats> existing = levelStatsRepo.findByUserIdAndLevelId(stats.getUserId(), stats.getLevelId());
        if (existing.isPresent()) {
            AdventureLevelStats toUpdate = existing.get();
            toUpdate.setStarsEarned(Math.max(toUpdate.getStarsEarned(), stats.getStarsEarned())); // keep best
            toUpdate.setCompleted(stats.isCompleted() || toUpdate.isCompleted());
            return levelStatsRepo.save(toUpdate);
        } else {
            return levelStatsRepo.save(stats);
        }
    }
} 