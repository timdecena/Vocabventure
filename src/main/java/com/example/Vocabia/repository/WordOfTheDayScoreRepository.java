package com.example.Vocabia.repository;

import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.WordOfTheDay;
import com.example.Vocabia.entity.WordOfTheDayScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import com.example.Vocabia.dto.WOTDLeaderboardEntryDTO;
import java.util.Optional;

public interface WordOfTheDayScoreRepository extends JpaRepository<WordOfTheDayScore, Long> {
    Optional<WordOfTheDayScore> findByStudentAndWord(User student, WordOfTheDay word);

    @Query("""
    SELECT 
        u.id AS studentId,
        CONCAT(u.firstName, ' ', u.lastName) AS studentName,
        SUM(s.playCount) AS totalPlayed,
        SUM(CASE WHEN s.correct = true THEN 1 ELSE 0 END) AS correctAnswers,
        ROUND(SUM(CASE WHEN s.correct = true THEN 1 ELSE 0 END) * 100.0 / SUM(s.playCount), 1) AS accuracyPercent
    FROM WordOfTheDayScore s
    JOIN s.student u
    GROUP BY u.id
    ORDER BY correctAnswers DESC, accuracyPercent DESC
""")
List<WOTDLeaderboardEntryDTO> fetchWOTDLeaderboard();

}
