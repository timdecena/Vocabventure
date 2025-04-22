package com.backend.VocabVenture.service;

import com.backend.VocabVenture.model.ClassEntity;
import com.backend.VocabVenture.model.User;
import com.backend.VocabVenture.repository.ClassRepository;
import com.backend.VocabVenture.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClassService {

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private UserRepository userRepository;

    public ClassEntity createClass(String className, String description, Long teacherId) {
        User teacher = userRepository.findById(teacherId).orElseThrow(() -> new RuntimeException("Teacher not found"));

        ClassEntity newClass = new ClassEntity();
        newClass.setClassName(className);
        newClass.setDescription(description);
        newClass.setCreatedAt(LocalDateTime.now());
        newClass.setTeacher(teacher);

        return classRepository.save(newClass);
    }

    public List<ClassEntity> getClassesByTeacherId(Long teacherId) {
        User teacher = userRepository.findById(teacherId).orElseThrow(() -> new RuntimeException("Teacher not found"));
        return classRepository.findByTeacher(teacher);
    }
}
