package com.example.Vocabia.adventure.controller;

import com.example.Vocabia.adventure.entity.LevelProgress;
import com.example.Vocabia.adventure.service.LevelProgressService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/adventure/level-progress")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class LevelProgressController {

    private final LevelProgressService levelProgressService;

    public LevelProgressController(LevelProgressService levelProgressService) {
        this.levelProgressService = levelProgressService;
    }

    @GetMapping
    public List<LevelProgress> getAllForUser(Principal principal) {
        return levelProgressService.getAllForUser(principal.getName());
    }

    @PostMapping("/save")
    public LevelProgress save(@RequestBody LevelProgress progress, Principal principal) {
        return levelProgressService.save(progress, principal.getName());
    }
}
