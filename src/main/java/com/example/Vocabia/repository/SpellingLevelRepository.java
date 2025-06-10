package com.example.Vocabia.repository;

import com.example.Vocabia.entity.SpellingLevel;
import com.example.Vocabia.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpellingLevelRepository extends JpaRepository<SpellingLevel, Long> {
    List<SpellingLevel> findByClassroom(Classroom classroom);
}
