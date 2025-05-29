package com.example.Vocabia.repository;

import com.example.Vocabia.entity.Level;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LevelRepository extends JpaRepository<Level, Long> {
    List<Level> findByClassroom_Id(Long classroomId);
    Optional<Level> findByCategoryAndName(String category, String name);
    Optional<Level> findByNumberAndCategory(int number, String category);

}
