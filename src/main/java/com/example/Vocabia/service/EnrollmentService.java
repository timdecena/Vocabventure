package com.example.Vocabia.service;

import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.Enrollment;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.ClassroomRepository;
import com.example.Vocabia.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepository;
    private final ClassroomRepository classroomRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository, ClassroomRepository classroomRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.classroomRepository = classroomRepository;
    }

    @Transactional
    public void joinClassroom(User student, String joinCode) {
        Classroom classroom = classroomRepository.findByJoinCode(joinCode)
                .orElseThrow(() -> new RuntimeException("Invalid join code"));

        // Check if already enrolled
        if (enrollmentRepository.findByStudentAndClassroom(student, classroom).isPresent()) {
            throw new RuntimeException("Already enrolled in this class");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setClassroom(classroom);
        enrollmentRepository.save(enrollment);
    }

    public List<Classroom> getStudentClasses(User student) {
        return enrollmentRepository.findByStudent(student)
                .stream()
                .map(Enrollment::getClassroom)
                .collect(Collectors.toList());
    }

    public List<User> getClassmates(Classroom classroom) {
        return enrollmentRepository.findByClassroom(classroom)
                .stream()
                .map(Enrollment::getStudent)
                .collect(Collectors.toList());
    }
}
