package com.vocabventure.controller;

import com.vocabventure.dto.AdventureLevelStatsDTO;
import com.vocabventure.service.AdventureLevelStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adventure-level-stats")
@CrossOrigin(origins = "http://localhost:3000")
public class AdventureLevelStatsController {

    @Autowired
    private AdventureLevelStatsService statsService;

    @GetMapping
    public ResponseEntity<List<AdventureLevelStatsDTO>> getLevelStats(
            @RequestParam Long user_id,
            @RequestParam Integer island) {
        List<AdventureLevelStatsDTO> stats = statsService.getLevelStats(user_id, island);
        return ResponseEntity.ok(stats);
    }

    @PostMapping
    public ResponseEntity<AdventureLevelStatsDTO> saveLevelStats(
            @RequestBody AdventureLevelStatsDTO statsDTO) {
        AdventureLevelStatsDTO savedStats = statsService.saveLevelStats(statsDTO);
        return ResponseEntity.ok(savedStats);
    }
} 