package com.backend.VocabVenture.repository;


import com.backend.VocabVenture.model.AdventureProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdventureProgressRepository extends JpaRepository<AdventureProgress, Long> {
    Optional<AdventureProgress> findByUserIdAndLevelId(Long userId, Long levelId);
}
