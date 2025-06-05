package com.example.Vocabia.adventure.controller;

import com.example.Vocabia.adventure.entity.GameLevel;
import com.example.Vocabia.adventure.service.GameLevelService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adventure/levels")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class GameLevelController {

    private final GameLevelService levelService;

    public GameLevelController(GameLevelService levelService) {
        this.levelService = levelService;
    }

    @GetMapping
    public List<GameLevel> getAllLevels() {
        return levelService.getAllLevels();
    }

    @GetMapping("/{id}")
    public GameLevel getLevelById(@PathVariable Long id) {
        return levelService.getLevelById(id);
    }
}
