package com.backend.VocabVenture.repository;

import com.backend.VocabVenture.model.AdventureProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdventureProfileRepository extends JpaRepository<AdventureProfile, Long> {
    Optional<AdventureProfile> findByUserId(Long userId);
} 