package com.example.Vocabia.repository;

import com.example.Vocabia.entity.GameProgress;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface GameProgressRepository extends JpaRepository<GameProgress, Long> {
    Optional<GameProgress> findByUserAndPuzzle(User user, FourPicOneWordPuzzle puzzle);
    List<GameProgress> findByUser(User user);
    long countByUserAndCompleted(User user, boolean completed);
    List<GameProgress> findByUserAndCompleted(User user, boolean completed);
}
