package com.example.Vocabia.adventure.service;

import com.example.Vocabia.adventure.entity.LevelProgress;
import com.example.Vocabia.adventure.repository.LevelProgressRepository;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LevelProgressService {

    private final LevelProgressRepository progressRepo;
    private final UserRepository userRepo;

    public LevelProgressService(LevelProgressRepository progressRepo, UserRepository userRepo) {
        this.progressRepo = progressRepo;
        this.userRepo = userRepo;
    }

    public List<LevelProgress> getAllForUser(String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        return progressRepo.findByUser(user);
    }

    public LevelProgress save(LevelProgress progress, String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        progress.setUser(user);
        return progressRepo.save(progress);
    }
}
