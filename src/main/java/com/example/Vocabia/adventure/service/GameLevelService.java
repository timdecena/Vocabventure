package com.example.Vocabia.adventure.service;

import com.example.Vocabia.adventure.entity.GameLevel;
import com.example.Vocabia.adventure.repository.GameLevelRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameLevelService {

    private final GameLevelRepository levelRepo;

    public GameLevelService(GameLevelRepository levelRepo) {
        this.levelRepo = levelRepo;
    }

    public List<GameLevel> getAllLevels() {
        return levelRepo.findAll();
    }

    public GameLevel getLevelById(Long id) {
        return levelRepo.findById(id).orElseThrow();
    }
}
