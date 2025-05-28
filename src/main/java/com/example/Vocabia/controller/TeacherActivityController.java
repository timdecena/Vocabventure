package com.example.Vocabia.controller;

import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.Level;
import com.example.Vocabia.service.ActivityService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/teacher/activities")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TeacherActivityController {
    private final ActivityService activityService;

    public TeacherActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping("/create")
    public Level createLevel(@RequestParam String name,
                             @RequestParam String description,
                             @RequestParam Integer number,
                             @RequestParam(required = false) Long classroomId,
                             @RequestParam String teacherEmail) {
        return activityService.createLevel(name, description, number, classroomId, teacherEmail);
    }

    @PostMapping("/{levelId}/add-puzzle")
    public FourPicOneWordPuzzle addPuzzleToLevel(@PathVariable Long levelId,
                                                 @RequestParam String answer,
                                                 @RequestParam String hint,
                                                 @RequestParam("images") List<MultipartFile> images) throws IOException {
        if (images.size() != 4) throw new RuntimeException("Exactly 4 images required");
        return activityService.addPuzzleToLevel(levelId, answer, hint, images);
    }
}
