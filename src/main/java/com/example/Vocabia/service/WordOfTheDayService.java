package com.example.Vocabia.service;

import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.WordOfTheDay;
import com.example.Vocabia.entity.WordOfTheDayScore;
import com.example.Vocabia.repository.WordOfTheDayRepository;
import com.example.Vocabia.repository.WordOfTheDayScoreRepository;
import com.example.Vocabia.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class WordOfTheDayService {

    private final WordOfTheDayRepository wordRepo;
    private final WordOfTheDayScoreRepository scoreRepo;
    private final UserRepository userRepo;

    public WordOfTheDay getTodayWord() {
        LocalDate today = computeGameDate();
        return wordRepo.findByDateAvailable(today)
                .orElseThrow(() -> new RuntimeException("No word set for today"));
    }

    public boolean hasPlayed(User student, WordOfTheDay word) {
        return scoreRepo.findByStudentAndWord(student, word).isPresent();
    }

    public WordOfTheDayScore submit(User student, String guess) {
    WordOfTheDay todayWord = getTodayWord();

    WordOfTheDayScore score = scoreRepo.findByStudentAndWord(student, todayWord).orElse(null);
    if (score != null && score.isCorrect()) {
        throw new RuntimeException("Already answered correctly today");
    }

    boolean correct = todayWord.getWord().equalsIgnoreCase(guess.trim());

    if (score == null) {
    score = new WordOfTheDayScore();
    score.setStudent(student);
    score.setWord(todayWord);
    score.setPlayCount(1); // first attempt
} else {
    score.setPlayCount(score.getPlayCount() + 1); // increment on every new attempt
}


    score.setCorrect(correct);
    score.setScore(correct ? 1 : 0);
    scoreRepo.save(score);

    return score;
}

    public void retry(User student) {
    WordOfTheDay todayWord = getTodayWord();

    if (student.getGold() < 10) {
        throw new RuntimeException("Not enough gold to retry.");
    }

    WordOfTheDayScore score = scoreRepo.findByStudentAndWord(student, todayWord)
        .orElseThrow(() -> new RuntimeException("No score to retry."));

    score.setCorrect(false); // Reset correctness
    score.setScore(0); // Reset score
    score.setPlayCount(score.getPlayCount() + 1); // Increment retries

    scoreRepo.save(score);

    student.setGold(student.getGold() - 10);
    userRepo.save(student);
}

    private LocalDate computeGameDate() {
        ZoneId zone = ZoneId.of("Asia/Manila");
        LocalDate now = LocalDate.now(zone);
        LocalTime current = LocalTime.now(zone);
        return current.isBefore(LocalTime.of(7, 0)) ? now.minusDays(1) : now;
    }

     public List<String> generateChoices(String correctWord) {
    List<String> allWords = wordRepo.findAll()
            .stream()
            .map(WordOfTheDay::getWord)
            .collect(Collectors.toList());

    List<String> distractors = allWords.stream()
            .filter(w -> !w.equalsIgnoreCase(correctWord))
            .collect(Collectors.toList());

    Collections.shuffle(distractors);

    List<String> choices = new ArrayList<>();
    choices.add(correctWord);
    choices.addAll(distractors.subList(0, Math.min(3, distractors.size())));

    Collections.shuffle(choices);
    return choices;
}
}
