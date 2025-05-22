package com.backend.VocabVenture.service;

import com.backend.VocabVenture.model.ClassEntity;
import com.backend.VocabVenture.model.User;
import com.backend.VocabVenture.repository.ClassRepository;
import com.backend.VocabVenture.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentClassService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;

    public StudentClassService(ClassRepository classRepository, UserRepository userRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentStudent() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public ClassEntity joinClass(String joinCode) {
        ClassEntity classEntity = classRepository.findByJoinCode(joinCode.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Invalid join code"));

        User student = getCurrentStudent();

        if (classEntity.getStudents().stream().anyMatch(s -> s.getId().equals(student.getId()))) {
            throw new RuntimeException("Already joined this class");
        }

        classEntity.getStudents().add(student);
        return classRepository.save(classEntity);
    }

    public void leaveClass(Long classId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        User student = getCurrentStudent();
        classEntity.getStudents().removeIf(s -> s.getId().equals(student.getId()));
        classRepository.save(classEntity);
    }

    public List<ClassEntity> getJoinedClasses() {
        User student = getCurrentStudent();
        return classRepository.findAllByStudents_Id(student.getId());
    }
}
