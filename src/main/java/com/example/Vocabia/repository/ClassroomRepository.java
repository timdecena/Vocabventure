package com.example.Vocabia.repository;

import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    Optional<Classroom> findByJoinCode(String joinCode);
    List<Classroom> findByTeacher(User teacher);
}
