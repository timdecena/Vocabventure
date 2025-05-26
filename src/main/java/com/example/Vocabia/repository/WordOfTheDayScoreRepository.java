package com.example.Vocabia.repository;

import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.WordOfTheDay;
import com.example.Vocabia.entity.WordOfTheDayScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WordOfTheDayScoreRepository extends JpaRepository<WordOfTheDayScore, Long> {
    Optional<WordOfTheDayScore> findByStudentAndWord(User student, WordOfTheDay word);
}
