package com.example.Vocabia.adventure.repository;

import com.example.Vocabia.adventure.entity.GameLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameLevelRepository extends JpaRepository<GameLevel, Long> {
    List<GameLevel> findByCategoryAndActiveTrueOrderByLevelNumber(String category);

    List<GameLevel> findByActiveTrue();

    List<String> findDistinctCategory();
}
