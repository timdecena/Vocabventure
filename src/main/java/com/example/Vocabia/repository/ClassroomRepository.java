package com.example.Vocabia.repository;

import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    List<Classroom> findByTeacher(UserEntity teacher);
}
