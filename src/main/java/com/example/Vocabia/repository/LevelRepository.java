package com.example.Vocabia.repository;

import com.example.Vocabia.entity.Level;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LevelRepository extends JpaRepository<Level, Long> {
    List<Level> findByClassroom_Id(Long classroomId);
}
