package com.example.Vocabia.repository;

import com.example.Vocabia.entity.SpellingChallengeScore;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.SpellingChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface SpellingChallengeScoreRepository extends JpaRepository<SpellingChallengeScore, Long> {
List<SpellingChallengeScore> findAllByStudentAndChallenge(User student, SpellingChallenge challenge);
    List<SpellingChallengeScore> findAllByStudent(User student);
        List<SpellingChallengeScore> findAllByStudentAndCorrect(User student, boolean correct);
long countByStudentAndChallenge(User student, SpellingChallenge challenge);

}
