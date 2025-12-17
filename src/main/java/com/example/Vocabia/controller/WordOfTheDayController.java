package com.example.Vocabia.controller;

import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.WordOfTheDay;
import com.example.Vocabia.service.UserService;
import com.example.Vocabia.service.WordOfTheDayService;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/game/word-of-the-day")
@RequiredArgsConstructor
public class WordOfTheDayController {

    private final WordOfTheDayService wotdService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getToday(Principal principal) {
        WordOfTheDay word;
        try {
            word = wotdService.getTodayWord();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404).body(Map.of(
                    "message", "No Word of the Day is configured yet.",
                    "error", ex.getMessage()
            ));
        }

        boolean hasPlayed = false;
        if (principal != null) {
            userService.findByEmail(principal.getName()).ifPresent(user -> {
                // Using array holder to mutate within lambda
            });
        }

        // If authenticated, compute hasPlayed
        if (principal != null) {
            User user = userService.findByEmail(principal.getName())
                    .orElse(null);
            if (user != null) {
                hasPlayed = wotdService.hasPlayed(user, word);
            }
        }

        List<String> choices = wotdService.generateChoices(word.getWord());

        return ResponseEntity.ok(Map.of(
                "definition", word.getDefinition(),
                "hasPlayed", hasPlayed,
                "imageUrl", word.getImageUrl(),
                "choices", choices
        ));
    }


    @PostMapping("/submit")
    public Map<String, Object> submitAnswer(@RequestBody GuessRequest guess, Principal principal) {
        User user = userService.findByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
        boolean correct = wotdService.submit(user, guess.getGuess()).isCorrect();
        return Map.of("correct", correct);
    }

    @Data
    public static class GuessRequest {
        private String guess;
    }

    @PostMapping("/retry")
public ResponseEntity<?> retry(Principal principal) {
    User student = userService.findByEmail(principal.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
    wotdService.retry(student);
    return ResponseEntity.ok(Map.of("message", "Retry granted", "gold", student.getGold()));
}

}
