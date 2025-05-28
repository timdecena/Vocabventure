package com.example.Vocabia.repository;

import com.example.Vocabia.entity.SpellingChallengeScore;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.SpellingChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface SpellingChallengeScoreRepository extends JpaRepository<SpellingChallengeScore, Long> {
    Optional<SpellingChallengeScore> findByStudentAndChallenge(User student, SpellingChallenge challenge);
    List<SpellingChallengeScore> findAllByStudent(User student);

}
