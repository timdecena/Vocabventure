package com.example.Vocabia.repository;

import com.example.Vocabia.entity.WordOfTheDay;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface WordOfTheDayRepository extends JpaRepository<WordOfTheDay, Long> {
    Optional<WordOfTheDay> findByDateAvailable(LocalDate date);
}