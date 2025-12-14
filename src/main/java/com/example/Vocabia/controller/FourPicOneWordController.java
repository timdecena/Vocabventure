package com.example.Vocabia.controller;

import com.example.Vocabia.dto.FourPicOneWordDTO;
import com.example.Vocabia.entity.FourPicOneWord;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.service.FourPicOneWordService;
import com.example.Vocabia.service.UserService;
import com.example.Vocabia.config.ImagePathConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/fpow")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FourPicOneWordController {

    private final FourPicOneWordService service;
    private final UserService userService;
    private final ImagePathConfig imagePathConfig;

    
    // ✅ GET /api/fpow/categories?classroomId=1 - Get classroom-specific categories
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories(@RequestParam(required = false) Long classroomId) {
        try {
            if (classroomId != null) {
                List<String> categories = service.getCategoriesByClassroom(classroomId);
                return ResponseEntity.ok(categories);
            } else {
                // Legacy: return all categories (for Adventure Mode)
                List<String> categories = service.getCategories();
                return ResponseEntity.ok(categories);
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // ✅ GET /api/fpow/levels?classroomId=1&category=Animals - Get classroom-specific levels
    @GetMapping("/levels")
    public ResponseEntity<List<Integer>> getLevelsByCategory(
            @RequestParam(required = false) Long classroomId,
            @RequestParam("category") String category) {
        try {
            if (classroomId != null) {
                List<Integer> levels = service.getLevelsByClassroomAndCategory(classroomId, category);
                return ResponseEntity.ok(levels);
            } else {
                // Legacy: return levels without classroom filter (for Adventure Mode)
                List<Integer> levels = service.getLevelsByCategory(category);
                return ResponseEntity.ok(levels);
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // ✅ GET /api/fpow/level-status?classroomId=1&category=Animals&level=5 - Get level status (active/inactive)
    @GetMapping("/level-status")
    public ResponseEntity<Map<String, Object>> getLevelStatus(
            @RequestParam(required = false) Long classroomId,
            @RequestParam("category") String category,
            @RequestParam("level") int level) {
        try {
            if (classroomId != null) {
                Optional<Boolean> status = service.getLevelStatusByClassroomAndCategoryAndLevel(classroomId, category, level);
                Map<String, Object> response = new HashMap<>();
                response.put("isActive", status.orElse(false));
                return ResponseEntity.ok(response);
            } else {
                // For legacy (Adventure Mode), assume active
                Map<String, Object> response = new HashMap<>();
                response.put("isActive", true);
                return ResponseEntity.ok(response);
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // ✅ GET /api/fpow/puzzle?classroomId=1&category=Animals&level=1 - Get classroom-specific puzzle
    @GetMapping("/puzzle")
    public ResponseEntity<FourPicOneWordDTO> getPuzzle(
            @RequestParam(required = false) Long classroomId,
            @RequestParam("category") String category,
            @RequestParam("level") int level) {
        try {
            if (classroomId != null) {
                return service.getPuzzleByClassroomAndCategoryAndLevel(classroomId, category, level)
                        .map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
            } else {
                // Legacy: return puzzle without classroom filter (for Adventure Mode)
                return service.getPuzzleByCategoryAndLevel(category, level)
                        .map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPuzzle(
        Principal principal,
        @RequestParam("classroomId") Long classroomId,
        @RequestParam("category") String category,
        @RequestParam("level") int level,
        @RequestParam("answer") String answer,
        @RequestParam(value = "hint", required = false) String hint,
        @RequestParam("hintType") String hintType,
        @RequestParam("difficulty") String difficultyStr,
        @RequestParam(value = "images", required = false) MultipartFile[] images
) {
    try {
        // --- Validate difficulty string and convert to enum ---
        FourPicOneWord.Difficulty difficulty;
        try {
            difficulty = FourPicOneWord.Difficulty.valueOf(difficultyStr.trim().toUpperCase());
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Invalid difficulty. Allowed: EASY, MEDIUM, HARD");
        }

        // --- Validate images count (1-4 images allowed) ---
        if (images == null || images.length == 0) {
            return ResponseEntity.badRequest().body("At least 1 image is required to create a puzzle.");
        }
        if (images.length > 4) {
            return ResponseEntity.badRequest().body("Maximum 4 images allowed per puzzle.");
        }

        // Ensure upload directory exists (handled by ImagePathConfig)
        File dir = new File(imagePathConfig.getFpowImageDir());
        if (!dir.exists() && !dir.mkdirs()) {
            return ResponseEntity.status(500).body("Failed to create upload directory: " + imagePathConfig.getFpowImageDir());
        }

        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile file : images) {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("One of the uploaded files is empty.");
            }

            // Optional: Per-file size limit (e.g., 3MB)
            long maxBytes = 3L * 1024 * 1024;
            if (file.getSize() > maxBytes) {
                return ResponseEntity.badRequest().body("Each image must be <= 3MB.");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
                return ResponseEntity.badRequest().body("All uploaded files must be images.");
            }

            // Sanitize original filename to avoid path issues
            String original = file.getOriginalFilename();
            if (original == null || original.trim().isEmpty()) {
                original = "image.jpg";
            }
            String safeName = original.replaceAll("[^a-zA-Z0-9\\.\\-\\_]", "_");

            String filename = System.currentTimeMillis() + "_" + safeName;
            Path filePath = Paths.get(imagePathConfig.getFpowImagePath(filename));

            try {
                Files.write(filePath, file.getBytes());
            } catch (IOException ioe) {
                return ResponseEntity.status(500).body("Failed to save uploaded file: " + safeName);
            }

            // Use the centralized URL generation
            String publicPath = imagePathConfig.getFpowImageUrl(filename);
            imageUrls.add(publicPath);
        }

        // Build DTO and set enum difficulty - supports 1-4 images dynamically
        FourPicOneWordDTO dto = new FourPicOneWordDTO();
        dto.setCategory(category);
        dto.setLevel(level);
        dto.setAnswer(answer);
        dto.setHint(hint);
        dto.setHintType(hintType);
        dto.setDifficulty(difficulty); // <-- enum value
        
        // ✅ Dynamic image assignment based on uploaded count
        dto.setImage1Url(imageUrls.size() > 0 ? imageUrls.get(0) : null);
        dto.setImage2Url(imageUrls.size() > 1 ? imageUrls.get(1) : null);
        dto.setImage3Url(imageUrls.size() > 2 ? imageUrls.get(2) : null);
        dto.setImage4Url(imageUrls.size() > 3 ? imageUrls.get(3) : null);
        
        // ✅ Get teacher ID from authenticated user
        String teacherEmail = principal.getName();
        User teacher = userService.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherEmail));
        Long teacherId = teacher.getId();
        
        // ✅ Log the dynamic image assignment for debugging
        System.out.println("✅ Creating FPOW puzzle with " + imageUrls.size() + " images: " + 
                          category + " Level " + level + " for Classroom " + classroomId);

        FourPicOneWordDTO saved = service.createPuzzle(dto, classroomId, teacherId);

        return ResponseEntity.ok(saved);

    } catch (IllegalArgumentException iae) {
        return ResponseEntity.badRequest().body(iae.getMessage());
    } catch (Exception ex) {
        ex.printStackTrace();
        return ResponseEntity.status(500).body("Server error while creating puzzle");
    }
}

    // Cleanup endpoints temporarily disabled until FPOWCleanupService is available on disk.
}
