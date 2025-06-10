package com.example.Vocabia.controller;

import com.example.Vocabia.dto.CreateSpellingLevelRequest;
import com.example.Vocabia.dto.SpellingLevelDTO;
import com.example.Vocabia.entity.SpellingChallenge;
import com.example.Vocabia.entity.SpellingLevel;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.service.SpellingLevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/spelling-level")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SpellingLevelController {

    private final SpellingLevelService levelService;
    private final UserRepository userRepo;

    private User getCurrentUser(Principal principal) {
        return userRepo.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/create")
    public SpellingLevel createLevel(@RequestBody CreateSpellingLevelRequest dto, Principal principal) {
        User teacher = getCurrentUser(principal);
        return levelService.createLevel(dto, teacher);
    }

    @GetMapping("/classroom/{classroomId}")
    public List<SpellingLevelDTO> getLevels(@PathVariable Long classroomId) {
        return levelService.getLevelsForClassroom(classroomId).stream()
                .map(level -> new SpellingLevelDTO(level.getId(), level.getTitle()))
                .collect(Collectors.toList());
    }

    @GetMapping("/{levelId}/challenges")
    public List<SpellingChallenge> getChallenges(@PathVariable Long levelId) {
        return levelService.getChallengesForLevel(levelId);
    }

    
} 
