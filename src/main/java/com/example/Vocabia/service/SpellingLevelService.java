package com.example.Vocabia.service;

import com.example.Vocabia.dto.CreateSpellingLevelRequest;
import com.example.Vocabia.entity.*;
import com.example.Vocabia.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SpellingLevelService {

    private final SpellingLevelRepository levelRepo;
    private final SpellingChallengeRepository challengeRepo;
    private final ClassroomRepository classroomRepo;

    public SpellingLevel createLevel(CreateSpellingLevelRequest dto, User teacher) {
        Classroom classroom = classroomRepo.findById(dto.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        SpellingLevel level = new SpellingLevel();
        level.setTitle(dto.getTitle());
        level.setClassroom(classroom);
        level = levelRepo.save(level);

        List<SpellingChallenge> challenges = new ArrayList<>();
        for (CreateSpellingLevelRequest.WordEntry entry : dto.getWords()) {
            SpellingChallenge ch = new SpellingChallenge();
            ch.setWord(entry.getWord());
            ch.setDefinition(entry.getDefinition());
            ch.setExampleSentence(entry.getSentence());
            ch.setAudioUrl(entry.getAudioUrl());
            ch.setLevel(level);
            ch.setTeacher(teacher);
            ch.setClassroom(classroom);
            challenges.add(ch);
        }

        challengeRepo.saveAll(challenges);
        return level;
    }

    public List<SpellingLevel> getLevelsForClassroom(Long classroomId) {
        Classroom classroom = new Classroom();
        classroom.setId(classroomId);
        return levelRepo.findByClassroom(classroom);
    }

    public List<SpellingChallenge> getChallengesForLevel(Long levelId) {
        return challengeRepo.findAll().stream()
                .filter(c -> c.getLevel() != null && c.getLevel().getId().equals(levelId))
                .toList();
    }

    public SpellingLevel getLevelWithChallenges(Long levelId) {
    return levelRepo.findById(levelId)
            .orElseThrow(() -> new RuntimeException("Level not found"));
}

public List<SpellingChallenge> getFlatChallengeList(Long levelId) {
    return challengeRepo.findAll().stream()
        .filter(ch -> ch.getLevel() != null && ch.getLevel().getId().equals(levelId))
        .toList();
}

}
