package com.example.Vocabia.service;

import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.WordOfTheDay;
import com.example.Vocabia.entity.WordOfTheDayScore;
import com.example.Vocabia.repository.WordOfTheDayRepository;
import com.example.Vocabia.repository.WordOfTheDayScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class WordOfTheDayService {
    private final WordOfTheDayRepository wordRepo;
    private final WordOfTheDayScoreRepository scoreRepo;

    public WordOfTheDay getTodayWord() {
        return wordRepo.findByDateAvailable(LocalDate.now()).orElse(null);
    }

    public boolean hasPlayedToday(User student) {
        return scoreRepo.findByStudentAndDatePlayed(student, LocalDate.now()).isPresent();
    }

    public void submitScore(User student, int score) {
        if (!hasPlayedToday(student)) {
            WordOfTheDayScore entry = new WordOfTheDayScore(null, score, student, LocalDate.now());
            scoreRepo.save(entry);
        } else {
            throw new RuntimeException("Already played today");
        }
    }
}
