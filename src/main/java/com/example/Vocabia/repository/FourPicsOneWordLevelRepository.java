package com.example.Vocabia.repository;

import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.FourPicsOneWordLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FourPicsOneWordLevelRepository extends JpaRepository<FourPicsOneWordLevel, Long> {
    List<FourPicsOneWordLevel> findByIsGlobalTrue();
    List<FourPicsOneWordLevel> findByClassroom(Classroom classroom);
}
