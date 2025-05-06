package com.backend.VocabVenture.repository;

import com.backend.VocabVenture.model.GameLevel;
import com.backend.VocabVenture.model.LevelProgress;
import com.backend.VocabVenture.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LevelProgressRepository extends JpaRepository<LevelProgress, Long> {
    
    // Find all progress entries for a specific user
    List<LevelProgress> findByUserOrderByCompletedAtDesc(User user);
    
    // Find progress for a specific user and level
    Optional<LevelProgress> findByUserAndGameLevel(User user, GameLevel gameLevel);
    
    // Check if a user has completed a specific level
    boolean existsByUserAndGameLevel(User user, GameLevel gameLevel);
    
    // Find all progress entries for a user in a specific category
    @Query("SELECT lp FROM LevelProgress lp WHERE lp.user = ?1 AND lp.gameLevel.category = ?2 ORDER BY lp.gameLevel.levelNumber")
    List<LevelProgress> findByUserAndCategory(User user, String category);
    
    // Count completed levels for a user
    long countByUser(User user);
    
    // Count completed levels for a user in a specific category
    @Query("SELECT COUNT(lp) FROM LevelProgress lp WHERE lp.user = ?1 AND lp.gameLevel.category = ?2")
    long countByUserAndCategory(User user, String category);
    
    // Get the latest completed level for a user
    Optional<LevelProgress> findTopByUserOrderByCompletedAtDesc(User user);
}
