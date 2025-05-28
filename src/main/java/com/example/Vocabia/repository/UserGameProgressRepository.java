package com.example.Vocabia.repository;

import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.UserGameProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserGameProgressRepository extends JpaRepository<UserGameProgress, Long> {
    Optional<UserGameProgress> findByUserAndPuzzleAndGameType(User user, FourPicOneWordPuzzle puzzle, String gameType);
    Optional<UserGameProgress> findByUserAndGameTypeAndCategoryAndLevel(User user, String gameType, String category, String level);
    List<UserGameProgress> findByUserAndGameType(User user, String gameType);
    long countByUserAndGameTypeAndCompleted(User user, String gameType, boolean completed);
}

