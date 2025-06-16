package com.example.Vocabia.service;

import com.example.Vocabia.entity.*;
import com.example.Vocabia.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpellingChallengeGameService {

    private final SpellingChallengeRepository challengeRepo;
    private final SpellingChallengeScoreRepository scoreRepo;

    public List<SpellingChallenge> getAllForClassroom(Long classroomId) {
        Classroom classroom = new Classroom();
        classroom.setId(classroomId);
            return challengeRepo.findByClassroom(classroom);
    }

    public boolean hasPlayed(User student, SpellingChallenge challenge) {
        return scoreRepo.findByStudentAndChallenge(student, challenge).isPresent();
    }

    public SpellingChallengeScore submitAnswer(User student, Long challengeId, String guess) {
        SpellingChallenge challenge = challengeRepo.findById(challengeId)
            .orElseThrow(() -> new RuntimeException("Challenge not found"));

        if (hasPlayed(student, challenge)) {
            throw new RuntimeException("Already played");
        }

        boolean correct = challenge.getWord().equalsIgnoreCase(guess.trim());

        SpellingChallengeScore score = new SpellingChallengeScore();
        score.setStudent(student);
        score.setChallenge(challenge);
        score.setCorrect(correct);
        score.setScore(correct ? 1 : 0);
        return scoreRepo.save(score);
    }

    public List<Long> getCompletedChallengeIds(User student) {
    return scoreRepo.findAllByStudent(student)
            .stream()
            .map(score -> score.getChallenge().getId())
            .toList();
}

public List<Long> getCorrectChallengeIds(User student) {
    return scoreRepo.findAllByStudent(student)
        .stream()
        .filter(SpellingChallengeScore::isCorrect)
        .map(score -> score.getChallenge().getId())
        .toList();
}




}
