package com.backend.VocabVenture.service;

import com.backend.VocabVenture.dto.UserDTO;
import com.backend.VocabVenture.model.ClassEntity;
import com.backend.VocabVenture.model.User;
import com.backend.VocabVenture.repository.ClassRepository;
import com.backend.VocabVenture.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;

    public ClassService(ClassRepository classRepository, UserRepository userRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentTeacher() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
    }

    public List<ClassEntity> getAllClassesForTeacher() {
        return classRepository.findByTeacher(getCurrentTeacher());
    }

    public ClassEntity createClass(String name, String description) {
        ClassEntity classEntity = new ClassEntity(name, description, getCurrentTeacher());
        return classRepository.save(classEntity);
    }

    public ClassEntity updateClass(Long id, String name, String description) {
        ClassEntity classEntity = classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (!classEntity.getTeacher().getId().equals(getCurrentTeacher().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        classEntity.setClassName(name);
        classEntity.setDescription(description);
        return classRepository.save(classEntity);
    }

    public void deleteClass(Long id) {
        ClassEntity classEntity = classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (!classEntity.getTeacher().getId().equals(getCurrentTeacher().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        classRepository.delete(classEntity);
    }

    public List<UserDTO> getStudentsInClass(Long classId, String teacherUsername) {
    ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

    if (!classEntity.getTeacher().getUsername().equals(teacherUsername)) {
        throw new RuntimeException("Access denied: Not your class");
    }

    return classEntity.getStudents().stream()
            .map(user -> UserDTO.builder()
                    .username(user.getUsername())
                    .build())
            .toList();
}
}
