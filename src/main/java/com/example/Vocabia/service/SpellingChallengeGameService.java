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
    private final UserRepository userRepo;

    public List<SpellingChallenge> getAllForClassroom(Long classroomId) {
        Classroom classroom = new Classroom();
        classroom.setId(classroomId);
        return challengeRepo.findByClassroom(classroom);
    }

    public boolean hasPlayed(User student, SpellingChallenge challenge) {
    int allowed = (challenge.getLevel() != null) ? challenge.getLevel().getMaxAttempts() : 1;
    long used = scoreRepo.countByStudentAndChallenge(student, challenge);
    return used >= allowed; // ✅ only true if max attempts reached
}

public SpellingChallengeScore submitAnswer(User student, Long challengeId, String guess, double elapsedTime) {
    SpellingChallenge challenge = challengeRepo.findById(challengeId)
        .orElseThrow(() -> new RuntimeException("Challenge not found"));

    boolean correct = challenge.getWord().equalsIgnoreCase(guess.trim());

    long used = scoreRepo.countByStudentAndChallenge(student, challenge);

    SpellingChallengeScore score = new SpellingChallengeScore();
    score.setStudent(student);
    score.setChallenge(challenge);
    score.setCorrect(correct);
    score.setScore(correct ? 1 : 0);
    score.setAttempt((int) used + 1);

    if (correct) {
        if (elapsedTime <= 5.0) {
            student.setGold(student.getGold() + 10);
        }
        student.setCorrectAnswers(student.getCorrectAnswers() + 1);
        student.setProgressPoints(student.getProgressPoints() + 10);
        userRepo.save(student);
    }

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
