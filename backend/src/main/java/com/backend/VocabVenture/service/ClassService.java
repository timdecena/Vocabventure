package com.backend.VocabVenture.service;

import com.backend.VocabVenture.dto.StudentBasicDTO;
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
        classEntity.getStudents().clear(); // clear join table entries
        classRepository.save(classEntity);
        classRepository.delete(classEntity);
    }

    public List<StudentBasicDTO> getStudentsInClass(Long classId, String teacherUsername) {
    ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

    String classOwner = classEntity.getTeacher().getUsername();
    System.out.println("Class owned by: " + classOwner);
    System.out.println("Authenticated teacher: " + teacherUsername);

    if (!classOwner.equals(teacherUsername)) {
        throw new RuntimeException("Access denied: Not your class");
    }

    return classEntity.getStudents().stream()
            .map(student -> new StudentBasicDTO(student.getUsername()))
            .toList();
}

}
