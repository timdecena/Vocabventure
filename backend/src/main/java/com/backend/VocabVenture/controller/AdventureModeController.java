package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.model.*;
import com.backend.VocabVenture.repository.*;
import com.backend.VocabVenture.security.JwtUtils;
import com.backend.VocabVenture.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adventure")
@RequiredArgsConstructor
public class AdventureModeController {
    private final AdventureLevelRepository levelRepo;
    private final AdventureWordRepository wordRepo;
    private final GameService gameService;

    @GetMapping("/levels")
    public List<AdventureLevel> getAllLevels() {
        return levelRepo.findAll();
    }

    @GetMapping("/level/{id}")
    public ResponseEntity<?> getLevelDetails(@PathVariable Long id) {
        AdventureLevel level = levelRepo.findById(id).orElse(null);
        List<AdventureWord> words = wordRepo.findByLevelId(id);
        return ResponseEntity.ok().body(new Object() {
            public final AdventureLevel levelInfo = level;
            public final List<AdventureWord> wordList = words;
        });
    }

    @PostMapping("/level/{id}/submit")
    public AdventureProgress submitAnswer(@PathVariable Long id, @RequestParam String answer) {
        Long userId = JwtUtils.getUserIdFromContext();
        return gameService.handleCorrectAnswer(userId, id);
    }

    @PostMapping("/level")
    public ResponseEntity<?> createLevel(@RequestBody AdventureLevel level) {
        if (!"teacher".equalsIgnoreCase(JwtUtils.getRoleFromContext())) {
            return ResponseEntity.status(403).body("Forbidden: Only teachers can create levels.");
        }
        level.setTeacherId(JwtUtils.getUserIdFromContext());
        return ResponseEntity.ok(levelRepo.save(level));
    }

    @PostMapping("/level/{id}/word")
    public ResponseEntity<?> addWordToLevel(@PathVariable Long id, @RequestParam String word) {
        if (!"teacher".equalsIgnoreCase(JwtUtils.getRoleFromContext())) {
            return ResponseEntity.status(403).body("Forbidden: Only teachers can add words.");
        }
        AdventureWord newWord = AdventureWord.builder()
                .word(word)
                .levelId(id)
                .createdByTeacherId(JwtUtils.getUserIdFromContext())
                .build();
        return ResponseEntity.ok(wordRepo.save(newWord));
    }
} 