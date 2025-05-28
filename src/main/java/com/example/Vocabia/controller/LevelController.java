package com.example.Vocabia.controller;

import com.example.Vocabia.dto.LevelDTO;
import com.example.Vocabia.entity.Level;
import com.example.Vocabia.service.LevelService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/levels")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class LevelController {

    private final LevelService levelService;

    public LevelController(LevelService service) {
        this.levelService = service;
    }

    @GetMapping
    public List<LevelDTO> getAllLevels() {
        return levelService.getAllLevels()
                .stream()
                .map(l -> new LevelDTO(l.getId(), l.getNumber(), l.getName(), l.getDescription()))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public LevelDTO getLevel(@PathVariable Long id) {
        Level l = levelService.getLevelById(id)
                .orElseThrow(() -> new RuntimeException("Level not found"));
        return new LevelDTO(l.getId(), l.getNumber(), l.getName(), l.getDescription());
    }

    @PostMapping
    public LevelDTO createLevel(@RequestBody LevelDTO dto) {
        Level l = new Level();
        l.setNumber(dto.getNumber());
        l.setName(dto.getName());
        l.setDescription(dto.getDescription());
        l = levelService.saveLevel(l);
        return new LevelDTO(l.getId(), l.getNumber(), l.getName(), l.getDescription());
    }

    @DeleteMapping("/{id}")
    public void deleteLevel(@PathVariable Long id) {
        levelService.deleteLevel(id);
    }
}
