package com.backend.VocabVenture.repository;


import com.backend.VocabVenture.model.AdventureLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdventureLevelRepository extends JpaRepository<AdventureLevel, Long> {
    List<AdventureLevel> findByTeacherId(Long teacherId);
}