package com.example.Vocabia.repository;

import com.example.Vocabia.entity.Enrollment;
import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByClassroom(Classroom classroom);
    List<Enrollment> findByStudent(User student);
    Optional<Enrollment> findByStudentAndClassroom(User student, Classroom classroom);
}
