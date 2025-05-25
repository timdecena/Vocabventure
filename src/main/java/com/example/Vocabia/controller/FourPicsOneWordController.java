package com.example.Vocabia.controller;

import com.example.Vocabia.dto.FourPicsOneWordSubmissionDTO;
import com.example.Vocabia.dto.LeaderboardEntryDTO;
import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.FourPicsOneWordLevel;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.service.FourPicsOneWordService;
import lombok.RequiredArgsConstructor;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/game/4pics1word")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class FourPicsOneWordController {

    private final com.example.Vocabia.repository.ClassroomRepository classroomRepo;
    private final com.example.Vocabia.repository.FourPicsOneWordLevelRepository levelRepo;

    private final FourPicsOneWordService service;
    private final UserRepository userRepo;

    private User getUser(Principal principal) {
        return userRepo.findByEmail(principal.getName()).orElseThrow();
    }

    // STUDENT: Global Levels
    @GetMapping("/levels/global")
    public List<FourPicsOneWordLevel> getGlobalLevels() {
        return service.getGlobalLevels();
    }

    // STUDENT: Class Levels
    @GetMapping("/levels/class/{classId}")
    public List<FourPicsOneWordLevel> getClassLevels(@PathVariable Long classId, Principal principal) {
        return service.getClassLevels(classId, getUser(principal));
    }

    // STUDENT: Submit Answer
    @PostMapping("/submit")
    public void submitAnswer(@RequestBody FourPicsOneWordSubmissionDTO dto, Principal principal) {
        service.submitAnswer(getUser(principal), dto);
    }

    // TEACHER: Create Level
    @PostMapping(value = "/create", consumes = "multipart/form-data")
public ResponseEntity<?> createLevelWithImages(
        @RequestParam String word,
        @RequestParam String definition,
        @RequestParam boolean isGlobal,
        @RequestParam(required = false) Long classroomId,
        @RequestParam("image1") MultipartFile image1,
        @RequestParam("image2") MultipartFile image2,
        @RequestParam("image3") MultipartFile image3,
        @RequestParam("image4") MultipartFile image4,
        Principal principal) {

    User teacher = getUser(principal);

    try {
        // Save images locally (or to cloud if you want)
        String uploadDir = System.getProperty("user.dir") + "/uploads/4pics1word/";
        new File(uploadDir).mkdirs(); // Ensure the folder exists

        String img1Url = saveFile(image1, uploadDir);
        String img2Url = saveFile(image2, uploadDir);
        String img3Url = saveFile(image3, uploadDir);
        String img4Url = saveFile(image4, uploadDir);

        Classroom classroom = null;
        if (!isGlobal && classroomId != null) {
            classroom = classroomRepo.findById(classroomId)
                    .orElseThrow(() -> new RuntimeException("Classroom not found"));
            if (!classroom.getTeacher().getId().equals(teacher.getId())) {
                return ResponseEntity.status(403).body("Forbidden");
            }
        }

        FourPicsOneWordLevel level = new FourPicsOneWordLevel();
        level.setWord(word);
        level.setDefinition(definition);
        level.setImage1Url(img1Url);
        level.setImage2Url(img2Url);
        level.setImage3Url(img3Url);
        level.setImage4Url(img4Url);
        level.setGlobal(isGlobal);
        level.setClassroom(classroom);

        levelRepo.save(level);

        return ResponseEntity.ok("Level created successfully");
    } catch (Exception e) {
        return ResponseEntity.status(500).body("Failed to save level: " + e.getMessage());
    }
}

    // Leaderboards
    @GetMapping("/leaderboard/global")
    public List<LeaderboardEntryDTO> globalLeaderboard() {
        return service.getGlobalLeaderboard();
    }

    @GetMapping("/leaderboard/class/{classId}")
    public List<LeaderboardEntryDTO> classLeaderboard(@PathVariable Long classId) {
        return service.getClassLeaderboard(classId);
    }

    private String saveFile(MultipartFile file, String baseDir) throws IOException {
    String filename = UUID.randomUUID() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");
    Path uploadPath = Paths.get(baseDir);
    
    if (!Files.exists(uploadPath)) {
        Files.createDirectories(uploadPath);
    }

    Path filePath = uploadPath.resolve(filename);
    file.transferTo(filePath.toFile());

    return "/uploads/4pics1word/" + filename; // URL for frontend
}


}
