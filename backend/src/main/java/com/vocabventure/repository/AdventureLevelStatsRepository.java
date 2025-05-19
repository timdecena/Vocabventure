package com.vocabventure.repository;

import com.vocabventure.entity.AdventureLevelStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdventureLevelStatsRepository extends JpaRepository<AdventureLevelStats, Long> {
    List<AdventureLevelStats> findByUserIdAndIslandId(Long userId, Integer islandId);
    Optional<AdventureLevelStats> findByUserIdAndIslandIdAndLevelNumber(Long userId, Integer islandId, Integer levelNumber);
} 