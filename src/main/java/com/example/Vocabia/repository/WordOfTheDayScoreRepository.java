package com.example.Vocabia.repository;

import com.example.Vocabia.entity.WordOfTheDayScore;
import com.example.Vocabia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface WordOfTheDayScoreRepository extends JpaRepository<WordOfTheDayScore, Long> {
    Optional<WordOfTheDayScore> findByStudentAndDatePlayed(User student, LocalDate date);
}