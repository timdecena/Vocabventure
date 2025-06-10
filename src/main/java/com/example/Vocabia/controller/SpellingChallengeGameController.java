package com.example.Vocabia.controller;

import com.example.Vocabia.entity.SpellingChallenge;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.service.SpellingChallengeGameService;
import com.example.Vocabia.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/game/spelling")
@RequiredArgsConstructor
public class SpellingChallengeGameController {

    private final SpellingChallengeGameService gameService;
    private final UserService userService;

    // Use an explicit sub-path to prevent conflict with /correct and /completed
    @GetMapping("/classroom/{classroomId}")
    public List<SpellingChallenge> getChallenges(@PathVariable Long classroomId) {
        return gameService.getAllForClassroom(classroomId);
    }

    @PostMapping("/submit")
    public Map<String, Object> submit(@RequestBody AnswerRequest req, Principal principal) {
        User student = userService.findByEmail(principal.getName());
        var score = gameService.submitAnswer(student, req.getChallengeId(), req.getGuess());
        return Map.of("correct", score.isCorrect(), "score", score.getScore());
    }

    @GetMapping("/completed")
    public List<Long> getCompletedChallengeIds(Principal principal) {
        User student = userService.findByEmail(principal.getName());
        return gameService.getCompletedChallengeIds(student);
    }

    @GetMapping("/correct")
    public List<Long> getCorrectChallengeIds(Principal principal) {
        User student = userService.findByEmail(principal.getName());
        return gameService.getCorrectChallengeIds(student);
    }

    @Data
    public static class AnswerRequest {
        private Long challengeId;
        private String guess;
    }
}
