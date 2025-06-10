package com.example.Vocabia.adventure.service;

import com.example.Vocabia.adventure.entity.AdventureLevelStats;
import com.example.Vocabia.adventure.repository.AdventureLevelStatsRepository;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdventureLevelStatsService {

    private final AdventureLevelStatsRepository statsRepo;
    private final UserRepository userRepo;

    public AdventureLevelStatsService(AdventureLevelStatsRepository statsRepo, UserRepository userRepo) {
        this.statsRepo = statsRepo;
        this.userRepo = userRepo;
    }

    public List<AdventureLevelStats> getStatsForUser(String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        return statsRepo.findByUser(user);
    }

    public AdventureLevelStats saveStats(AdventureLevelStats stats, String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        stats.setUser(user);
        return statsRepo.save(stats);
    }
}
