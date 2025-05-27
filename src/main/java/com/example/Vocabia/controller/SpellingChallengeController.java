package com.example.Vocabia.controller;

import com.example.Vocabia.dto.CreateChallengeRequest;
import com.example.Vocabia.entity.SpellingChallenge;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.service.SpellingChallengeService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

import java.nio.file.Path;
import java.io.IOException;
import java.util.Map;


@RestController
@RequestMapping("/api/teacher/spelling")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SpellingChallengeController {

    private final SpellingChallengeService service;
    private final UserRepository userRepository;

    private User getCurrentUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/create")
    public SpellingChallenge create(@RequestBody CreateChallengeRequest dto, Principal principal) {
        User teacher = getCurrentUser(principal);
        return service.createChallenge(dto.getWord(), dto.getDefinition(), dto.getSentence(), dto.getAudioUrl(), teacher, dto.getClassroomId());
    }

    @GetMapping
    public List<SpellingChallenge> getMyChallenges(Principal principal) {
        User teacher = getCurrentUser(principal);
        return service.getTeacherChallenges(teacher);
    }

    @PostMapping("/upload-audio")
public ResponseEntity<?> uploadAudio(@RequestParam("file") MultipartFile file) {
    try {
        String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();
        Path audioDir = Paths.get("src/main/resources/static/audio/spelling");
        Files.createDirectories(audioDir);

        Path filePath = audioDir.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String fileUrl = "/audio/spelling/" + filename;
        return ResponseEntity.ok(Map.of("url", fileUrl));
    } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload audio");
    }
}

}
