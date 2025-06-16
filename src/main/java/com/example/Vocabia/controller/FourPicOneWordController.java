package com.example.Vocabia.controller;

import com.example.Vocabia.dto.FourPicOneWordDTO;
import com.example.Vocabia.service.FourPicOneWordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/fpow")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FourPicOneWordController {
    private final FourPicOneWordService service;

    // GET a specific puzzle by category + level
    @GetMapping("/puzzle")
    public FourPicOneWordDTO getPuzzle(@RequestParam String category, @RequestParam int level) {
        Optional<FourPicOneWordDTO> puzzle = service.getPuzzleByCategoryAndLevel(category, level);
        return puzzle.orElseThrow(() -> new RuntimeException("Puzzle not found"));
    }

    // GET all puzzles in a specific category
    @GetMapping("/puzzles")
    public List<FourPicOneWordDTO> getPuzzlesByCategory(@RequestParam String category) {
        return service.getPuzzlesByCategory(category);
    }

    // GET all available categories
    @GetMapping("/categories")
    public List<String> getCategories() {
        return service.getCategories();
    }

    // GET all level numbers for a given category
    @GetMapping("/levels")
    public List<Integer> getLevelsByCategory(@RequestParam String category) {
        return service.getLevelsByCategory(category);
    }
}
