package com.example.Vocabia.controller;

import com.example.Vocabia.dto.FourPicOneWordDTO;
import com.example.Vocabia.entity.FourPicOneWord;
import com.example.Vocabia.service.FourPicOneWordService;
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
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fpow")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FourPicOneWordController {

    private final FourPicOneWordService service;
    private final ImagePathConfig imagePathConfig;

    
    // ✅ GET /api/fpow/categories - Get all available categories
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        try {
            List<String> categories = service.getCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // ✅ GET /api/fpow/levels?category=Animals - Get levels for a specific category
    @GetMapping("/levels")
    public ResponseEntity<List<Integer>> getLevelsByCategory(@RequestParam("category") String category) {
        try {
            List<Integer> levels = service.getLevelsByCategory(category);
            return ResponseEntity.ok(levels);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // ✅ GET /api/fpow/puzzle?category=Animals&level=1 - Get specific puzzle
    @GetMapping("/puzzle")
    public ResponseEntity<FourPicOneWordDTO> getPuzzle(
            @RequestParam("category") String category,
            @RequestParam("level") int level) {
        try {
            return service.getPuzzleByCategoryAndLevel(category, level)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPuzzle(
        Principal principal,
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
        
        // ✅ Log the dynamic image assignment for debugging
        System.out.println("✅ Creating FPOW puzzle with " + imageUrls.size() + " images: " + 
                          category + " Level " + level);

        String teacherEmail = principal.getName();
        FourPicOneWordDTO saved = service.createPuzzle(dto, teacherEmail);

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
