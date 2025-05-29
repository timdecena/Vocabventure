package com.example.Vocabia.controller;

import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.Level;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.service.FourPicOneWordPuzzleService;
import com.example.Vocabia.service.LevelService;
import com.example.Vocabia.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teacher/challenges")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TeacherPuzzleChallengeController {

    private final FourPicOneWordPuzzleService puzzleService;
    private final LevelService levelService;
    private final UserService userService;
    private static final String UPLOAD_DIR = "static/images/challenges";

    public TeacherPuzzleChallengeController(
            FourPicOneWordPuzzleService puzzleService,
            LevelService levelService,
            UserService userService) {
        this.puzzleService = puzzleService;
        this.levelService = levelService;
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createChallenge(
            @RequestParam("images") MultipartFile[] images,
            @RequestParam("answer") String answer,
            @RequestParam("hint") String hint,
            @RequestParam(value = "targetClass", required = false) String targetClass,
            Authentication auth) {
        try {
            if (images.length != 4) {
                return ResponseEntity.badRequest().body("Exactly 4 images are required");
            }

            User teacher = userService.findByUsername(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            Level challengeLevel = levelService.findOrCreateLevel(
                    "challenges",
                    "challenge_" + teacher.getUsername()
            );

            String challengeId = UUID.randomUUID().toString();
            Path challengePath = Paths.get(UPLOAD_DIR, teacher.getUsername(), challengeId);
            Files.createDirectories(challengePath);

            List<String> imagePaths = new ArrayList<>();
            for (int i = 0; i < images.length; i++) {
                String filename = String.format("image%d.%s",
                        i + 1,
                        getFileExtension(images[i].getOriginalFilename())
                );
                Path filePath = challengePath.resolve(filename);
                Files.copy(images[i].getInputStream(), filePath);
                // For static resource, remove "static" so frontend can use /images/...
                imagePaths.add("/images/challenges/" + teacher.getUsername() + "/" + challengeId + "/" + filename);
            }

            FourPicOneWordPuzzle puzzle = new FourPicOneWordPuzzle();
            puzzle.setAnswer(answer.trim().toLowerCase());
            puzzle.setHint(hint);
            puzzle.setImages(imagePaths);
            puzzle.setLevel(challengeLevel);
            puzzle.setCreatedBy(teacher);
            puzzle.setTargetClass(targetClass);

            puzzleService.savePuzzle(puzzle);

            return ResponseEntity.ok("Challenge created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating challenge: " + e.getMessage());
        }
    }

    @GetMapping("/my-challenges")
    public ResponseEntity<?> getTeacherChallenges(Authentication auth) {
        try {
            User teacher = userService.findByUsername(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            List<FourPicOneWordPuzzle> challenges = puzzleService.getPuzzlesByTeacher(teacher);
            return ResponseEntity.ok(challenges);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching challenges: " + e.getMessage());
        }
    }

    private String getFileExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        if (idx == -1) return "";
        return filename.substring(idx + 1).toLowerCase();
    }
}
