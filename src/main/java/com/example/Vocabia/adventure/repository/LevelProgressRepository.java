package com.example.Vocabia.adventure.repository;

import com.example.Vocabia.adventure.entity.LevelProgress;
import com.example.Vocabia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LevelProgressRepository extends JpaRepository<LevelProgress, Long> {
    List<LevelProgress> findByUser(User user);
}
