package com.example.Vocabia.controller;

import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.WordOfTheDay;
import com.example.Vocabia.service.UserService;
import com.example.Vocabia.service.WordOfTheDayService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/game/word-of-the-day")
@RequiredArgsConstructor
public class WordOfTheDayController {

    private final WordOfTheDayService gameService;
    private final UserService userService;

    private User getCurrentUser(Principal principal) {
        return userService.findByEmail(principal.getName());
    }

    @GetMapping
    public WordOfTheDay getTodayLevel() {
        return gameService.getTodayWord();
    }

    @PostMapping("/submit")
    public String submit(@RequestParam int score, Principal principal) {
        User student = getCurrentUser(principal);
        gameService.submitScore(student, score);
        return "Score submitted!";
    }
}
