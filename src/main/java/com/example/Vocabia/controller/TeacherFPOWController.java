package com.example.Vocabia.controller;

import com.example.Vocabia.dto.FourPicOneWordDTO;
import com.example.Vocabia.entity.FourPicOneWord;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.service.FourPicOneWordService;
import com.example.Vocabia.config.ImagePathConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

@RestController
@RequestMapping("/api/teacher/fpow")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TeacherFPOWController {

    private final FourPicOneWordService fpowService;
    private final UserRepository userRepository;
    private final ImagePathConfig imagePathConfig;

    private User getCurrentUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * GET /api/teacher/fpow
     * Get all FPOW puzzles created by the current teacher
     */
    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<FourPicOneWordDTO>> getAllTeacherFPOWs(Principal principal) {
        try {
            User teacher = getCurrentUser(principal);
            if (!"TEACHER".equalsIgnoreCase(teacher.getRole())) {
                return ResponseEntity.status(403).build();
            }
            
            List<FourPicOneWordDTO> puzzles = fpowService.getAllPuzzlesByTeacher(teacher.getId());
            return ResponseEntity.ok(puzzles);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * PUT /api/teacher/fpow/:id
     * Update an existing FPOW puzzle (supports image uploads)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> updateFPOW(
            @PathVariable Long id,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "level", required = false) String levelStr,
            @RequestParam(value = "answer", required = false) String answer,
            @RequestParam(value = "hint", required = false) String hint,
            @RequestParam(value = "hintType", required = false) String hintType,
            @RequestParam(value = "difficulty", required = false) String difficultyStr,
            @RequestParam(value = "isActive", required = false) String isActiveStr,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            @RequestParam(value = "existingImageUrls", required = false) String[] existingImageUrls,
            Principal principal) {
        try {
            User teacher = getCurrentUser(principal);
            if (!"TEACHER".equalsIgnoreCase(teacher.getRole())) {
                return ResponseEntity.status(403).body("Only teachers can update FPOW puzzles");
            }
            
            // Get existing puzzle to preserve fields not being updated
            FourPicOneWordDTO existingDto = fpowService.getPuzzleByIdAndTeacher(id, teacher.getId())
                    .orElseThrow(() -> new RuntimeException("FPOW puzzle not found or you don't have permission to edit it"));
            
            // Build update DTO
            FourPicOneWordDTO dto = new FourPicOneWordDTO();
            dto.setId(existingDto.getId());
            dto.setClassroomId(existingDto.getClassroomId());
            dto.setTeacherId(existingDto.getTeacherId());
            
            // Update fields if provided, otherwise keep existing values
            dto.setCategory(category != null && !category.trim().isEmpty() ? category : existingDto.getCategory());
            dto.setLevel(levelStr != null ? Integer.parseInt(levelStr) : existingDto.getLevel());
            dto.setAnswer(answer != null && !answer.trim().isEmpty() ? answer : existingDto.getAnswer());
            dto.setHint(hint != null ? hint : existingDto.getHint());
            dto.setHintType(hintType != null ? hintType : existingDto.getHintType());
            dto.setDifficulty(difficultyStr != null ? 
                FourPicOneWord.Difficulty.valueOf(difficultyStr.trim().toUpperCase()) : existingDto.getDifficulty());
            dto.setActive(isActiveStr != null ? Boolean.parseBoolean(isActiveStr) : existingDto.isActive());
            
            // Handle images: combine existing URLs (if not removed) with new uploads
            List<String> finalImageUrls = new ArrayList<>();
            
            // Add existing image URLs that are being kept
            if (existingImageUrls != null) {
                for (String url : existingImageUrls) {
                    if (url != null && !url.trim().isEmpty()) {
                        finalImageUrls.add(url.trim());
                    }
                }
            }
            
            // Process new image uploads
            if (images != null && images.length > 0) {
                // Ensure upload directory exists
                File dir = new File(imagePathConfig.getFpowImageDir());
                if (!dir.exists() && !dir.mkdirs()) {
                    return ResponseEntity.status(500).body("Failed to create upload directory");
                }
                
                for (MultipartFile file : images) {
                    if (file == null || file.isEmpty()) {
                        continue;
                    }
                    
                    // Validate file size (3MB max)
                    long maxBytes = 3L * 1024 * 1024;
                    if (file.getSize() > maxBytes) {
                        return ResponseEntity.badRequest().body("Each image must be <= 3MB.");
                    }
                    
                    // Validate file type
                    String contentType = file.getContentType();
                    if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
                        return ResponseEntity.badRequest().body("All uploaded files must be images.");
                    }
                    
                    // Sanitize filename
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
                    
                    // Add to final list
                    String publicPath = imagePathConfig.getFpowImageUrl(filename);
                    finalImageUrls.add(publicPath);
                }
            }
            
            // Validate total image count
            if (finalImageUrls.isEmpty()) {
                return ResponseEntity.badRequest().body("At least 1 image is required");
            }
            if (finalImageUrls.size() > 4) {
                return ResponseEntity.badRequest().body("Maximum 4 images allowed");
            }
            
            // Set image URLs dynamically
            dto.setImage1Url(finalImageUrls.size() > 0 ? finalImageUrls.get(0) : null);
            dto.setImage2Url(finalImageUrls.size() > 1 ? finalImageUrls.get(1) : null);
            dto.setImage3Url(finalImageUrls.size() > 2 ? finalImageUrls.get(2) : null);
            dto.setImage4Url(finalImageUrls.size() > 3 ? finalImageUrls.get(3) : null);
            
            // Validate required fields
            if (dto.getCategory() == null || dto.getCategory().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Category is required");
            }
            if (dto.getAnswer() == null || dto.getAnswer().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Answer is required");
            }
            
            FourPicOneWordDTO updated = fpowService.updatePuzzle(id, teacher.getId(), dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server error while updating puzzle");
        }
    }

    /**
     * DELETE /api/teacher/fpow/:id
     * Delete an existing FPOW puzzle
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<?> deleteFPOW(@PathVariable Long id, Principal principal) {
        try {
            User teacher = getCurrentUser(principal);
            if (!"TEACHER".equalsIgnoreCase(teacher.getRole())) {
                return ResponseEntity.status(403).body("Only teachers can delete FPOW puzzles");
            }
            
            fpowService.deletePuzzle(id, teacher.getId());
            return ResponseEntity.ok().body("FPOW puzzle deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server error while deleting puzzle");
        }
    }
}

