package com.backend.VocabVenture.repository;

import com.backend.VocabVenture.model.AdventureLevelStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdventureLevelStatsRepository extends JpaRepository<AdventureLevelStats, Long> {
    List<AdventureLevelStats> findByUserId(Long userId);
    Optional<AdventureLevelStats> findByUserIdAndLevelId(Long userId, Long levelId);
} 