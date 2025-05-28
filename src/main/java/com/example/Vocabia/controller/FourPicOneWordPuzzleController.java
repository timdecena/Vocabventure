package com.example.Vocabia.controller;

import com.example.Vocabia.dto.FourPicOneWordPuzzleDTO;
import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.Level;
import com.example.Vocabia.service.FourPicOneWordPuzzleService;
import com.example.Vocabia.service.LevelService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/puzzles/4pics1word")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FourPicOneWordPuzzleController {

    private final FourPicOneWordPuzzleService puzzleService;
    private final LevelService levelService;

    public FourPicOneWordPuzzleController(FourPicOneWordPuzzleService puzzleService, LevelService levelService) {
        this.puzzleService = puzzleService;
        this.levelService = levelService;
    }

    @GetMapping
    public List<FourPicOneWordPuzzleDTO> getAllPuzzles() {
        return puzzleService.getAllPuzzles()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public FourPicOneWordPuzzleDTO getPuzzle(@PathVariable Long id) {
        FourPicOneWordPuzzle puzzle = puzzleService.getPuzzleById(id)
                .orElseThrow(() -> new RuntimeException("Puzzle not found"));
        return toDto(puzzle);
    }

    @GetMapping("/level/{levelId}")
    public List<FourPicOneWordPuzzleDTO> getPuzzlesByLevel(@PathVariable Long levelId) {
        Level level = levelService.getLevelById(levelId)
                .orElseThrow(() -> new RuntimeException("Level not found"));
        return puzzleService.getPuzzlesByLevel(level)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @PostMapping
    public FourPicOneWordPuzzleDTO createPuzzle(@RequestBody FourPicOneWordPuzzleDTO dto) {
        Level level = levelService.getLevelById(dto.getLevelId())
                .orElseThrow(() -> new RuntimeException("Level not found"));

        FourPicOneWordPuzzle puzzle = new FourPicOneWordPuzzle();
        puzzle.setAnswer(dto.getAnswer());
        puzzle.setHint(dto.getHint());
        puzzle.setImages(dto.getImages());
        puzzle.setLevel(level);

        puzzle = puzzleService.savePuzzle(puzzle);
        return toDto(puzzle);
    }

    private FourPicOneWordPuzzleDTO toDto(FourPicOneWordPuzzle p) {
        return new FourPicOneWordPuzzleDTO(
                p.getId(), p.getAnswer(), p.getHint(), p.getImages(),
                p.getLevel() != null ? p.getLevel().getId() : null
        );
    }
}
