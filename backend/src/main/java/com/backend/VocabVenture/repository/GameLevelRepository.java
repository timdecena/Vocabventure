package com.backend.VocabVenture.repository;

import com.backend.VocabVenture.model.GameLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameLevelRepository extends JpaRepository<GameLevel, Long> {
    
    // Find all levels in a specific category
    List<GameLevel> findByCategoryOrderByLevelNumber(String category);
    
    // Find a specific level by category and level number
    Optional<GameLevel> findByCategoryAndLevelNumber(String category, Integer levelNumber);
    
    // Find all active levels
    List<GameLevel> findByActiveTrue();
    
    // Find all active levels in a category
    List<GameLevel> findByCategoryAndActiveTrueOrderByLevelNumber(String category);
    
    // Find all categories (distinct)
    @Query("SELECT DISTINCT g.category FROM GameLevel g")
    List<String> findDistinctCategory();
    
    // Find levels by difficulty
    List<GameLevel> findByDifficultyOrderByCategory(GameLevel.Difficulty difficulty);
}
