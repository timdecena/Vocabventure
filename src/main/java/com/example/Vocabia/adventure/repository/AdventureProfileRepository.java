package com.example.Vocabia.adventure.repository;

import com.example.Vocabia.adventure.entity.AdventureProfile;
import com.example.Vocabia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdventureProfileRepository extends JpaRepository<AdventureProfile, Long> {
    Optional<AdventureProfile> findByUser(User user);
}
