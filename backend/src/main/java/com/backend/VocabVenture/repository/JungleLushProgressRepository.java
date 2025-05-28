package com.backend.VocabVenture.repository;

import com.backend.VocabVenture.model.JungleLushProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface JungleLushProgressRepository extends JpaRepository<JungleLushProgress, Long> {
    Optional<JungleLushProgress> findByUserId(Long userId);
} 