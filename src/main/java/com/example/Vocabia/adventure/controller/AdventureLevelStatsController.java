package com.example.Vocabia.adventure.controller;

import com.example.Vocabia.adventure.entity.AdventureLevelStats;
import com.example.Vocabia.adventure.service.AdventureLevelStatsService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/adventure/stats")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdventureLevelStatsController {

    private final AdventureLevelStatsService statsService;

    public AdventureLevelStatsController(AdventureLevelStatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping
    public List<AdventureLevelStats> getStatsForUser(Principal principal) {
        return statsService.getStatsForUser(principal.getName());
    }

    @PostMapping("/save")
    public AdventureLevelStats saveStats(@RequestBody AdventureLevelStats stats, Principal principal) {
        return statsService.saveStats(stats, principal.getName());
    }
}
