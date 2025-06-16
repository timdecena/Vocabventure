package com.example.Vocabia.controller;

import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.WordOfTheDay;
import com.example.Vocabia.service.UserService;
import com.example.Vocabia.service.WordOfTheDayService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/game/word-of-the-day")
@RequiredArgsConstructor
public class WordOfTheDayController {

    private final WordOfTheDayService wotdService;
    private final UserService userService;

    @GetMapping
public Map<String, Object> getToday(Principal principal) {
    User user = userService.findByEmail(principal.getName())
        .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
    WordOfTheDay word = wotdService.getTodayWord();
    boolean hasPlayed = wotdService.hasPlayed(user, word);

    return Map.of(
        "definition", word.getDefinition(),
        "hasPlayed", hasPlayed,
        "imageUrl", word.getImageUrl() // ✅ Add this line
    );
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
}
