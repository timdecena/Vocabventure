package com.example.Vocabia.adventure.repository;

import com.example.Vocabia.adventure.entity.LevelProgress;
import com.example.Vocabia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LevelProgressRepository extends JpaRepository<LevelProgress, Long> {
    
    List<LevelProgress> findByUserOrderByCompletedAtDesc(User user);

    List<LevelProgress> findByUserAndCategory(User user, String category);

    boolean existsByUserAndGameLevel(User user, com.example.Vocabia.adventure.entity.GameLevel gameLevel);

    long countByUser(User user);

    long countByUserAndCategory(User user, String category);

    Optional<LevelProgress> findTopByUserOrderByCompletedAtDesc(User user);
}
