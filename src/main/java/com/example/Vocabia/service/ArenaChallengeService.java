package com.example.Vocabia.service;

import com.example.Vocabia.dto.*;
import com.example.Vocabia.entity.*;
import com.example.Vocabia.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArenaChallengeService {

    private final WordListRepository listRepo;
    private final WordListItemRepository itemRepo;
    private final ArenaScoreRepository scoreRepo;
    private final UserRepository userRepo;

    public List<ArenaWordDTO> getRandomizedWords(Long wordListId) {
        List<WordListItem> items = itemRepo.findByWordListId(wordListId);
        Collections.shuffle(items);
        return items.stream().limit(10).map(i -> new ArenaWordDTO(i.getDefinition(), i.getWord())).toList();
    }

    public void evaluateAndSave(ArenaResultDTO result, String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        WordList list = listRepo.findById(result.getWordListId()).orElseThrow();

        int correct = 0;
        double totalTime = 0;
        for (ArenaAnswerDTO answer : result.getAnswers()) {
            if (answer.getCorrectWord().equalsIgnoreCase(answer.getStudentAnswer())) {
                correct++;
            }
            totalTime += answer.getResponseTime();
        }

        ArenaScore score = ArenaScore.builder()
                .student(user)
                .wordList(list)
                .correctAnswers(correct)
                .totalScore(correct * 3)
                .avgResponseTime(totalTime / result.getAnswers().size())
                .datePlayed(LocalDateTime.now())
                .build();

        scoreRepo.save(score);
    }

    public List<ArenaLeaderboardDTO> getLeaderboard(Long wordListId) {
        return scoreRepo.findByWordListIdOrderByTotalScoreDesc(wordListId).stream()
                .map(score -> new ArenaLeaderboardDTO(
                        score.getStudent().getFirstName() + " " + score.getStudent().getLastName(),
                        score.getTotalScore(),
                        score.getCorrectAnswers(),
                        score.getAvgResponseTime()
                )).toList();
    }
}
