package com.example.Vocabia.service;

import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.Enrollment;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.ClassroomRepository;
import com.example.Vocabia.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor; // <-- Lombok import
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // <-- Lombok will generate the constructor!
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final ClassroomRepository classroomRepository;

    public Enrollment joinClassroom(User student, String joinCode) {
        Classroom classroom = classroomRepository.findByJoinCode(joinCode)
                .orElseThrow(() -> new RuntimeException("Invalid join code"));
        if (!"STUDENT".equalsIgnoreCase(student.getRole()))
            throw new RuntimeException("Only students can join classes");
        if (enrollmentRepository.findByStudentAndClassroom(student, classroom).isPresent())
            throw new RuntimeException("Already joined");
        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setClassroom(classroom);
        return enrollmentRepository.save(enrollment);
    }

    public List<User> getClassmates(Classroom classroom) {
        return enrollmentRepository.findByClassroom(classroom)
                .stream()
                .map(Enrollment::getStudent)
                .collect(Collectors.toList());
    }

    public List<Classroom> getStudentClasses(User student) {
        return enrollmentRepository.findByStudent(student)
                .stream()
                .map(Enrollment::getClassroom)
                .collect(Collectors.toList());
    }
}
