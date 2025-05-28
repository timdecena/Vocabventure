package com.example.Vocabia.controller;

import com.example.Vocabia.dto.FourPicOneWordPuzzleDTO;
import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.Level;
import com.example.Vocabia.service.ActivityService;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/student/classes")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class StudentActivityController {
    private final ActivityService activityService;

    public StudentActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/{classId}/activities")
    public List<Level> getActivities(@PathVariable Long classId) {
        return activityService.getClassActivities(classId);
    }

    @GetMapping("/activities/{levelId}/puzzles")
    public List<FourPicOneWordPuzzleDTO> getPuzzles(@PathVariable Long levelId) {
        List<FourPicOneWordPuzzle> puzzles = activityService.getPuzzlesByLevel(levelId);
        List<FourPicOneWordPuzzleDTO> dtos = new ArrayList<>();
        for (FourPicOneWordPuzzle puzzle : puzzles) {
            FourPicOneWordPuzzleDTO dto = new FourPicOneWordPuzzleDTO(
                    puzzle.getId(),
                    puzzle.getAnswer(),
                    puzzle.getHint(),
                    puzzle.getImages(),
                    levelId
            );
            dtos.add(dto);
        }
        return dtos;
    }
}
