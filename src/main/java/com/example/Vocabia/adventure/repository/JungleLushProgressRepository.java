package com.example.Vocabia.adventure.repository;

import com.example.Vocabia.adventure.entity.JungleLushProgress;
import com.example.Vocabia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JungleLushProgressRepository extends JpaRepository<JungleLushProgress, Long> {
    List<JungleLushProgress> findByUser(User user);
    Optional<JungleLushProgress> findByUserAndIslandName(User user, String islandName);
}
