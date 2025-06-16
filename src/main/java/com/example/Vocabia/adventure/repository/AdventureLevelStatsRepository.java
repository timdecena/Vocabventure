package com.example.Vocabia.adventure.repository;

import com.example.Vocabia.adventure.entity.AdventureLevelStats;
import com.example.Vocabia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdventureLevelStatsRepository extends JpaRepository<AdventureLevelStats, Long> {
    List<AdventureLevelStats> findByUser(User user);
}
