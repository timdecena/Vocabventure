package com.example.Vocabia.service;

import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClassroomService {

    private final ClassroomRepository classroomRepository;

    public String generateJoinCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    public Classroom createClassroom(String name, String description, User teacher) {
        Classroom classroom = new Classroom();
        classroom.setName(name);
        classroom.setDescription(description);
        classroom.setJoinCode(generateJoinCode());
        classroom.setTeacher(teacher);
        return classroomRepository.save(classroom);
    }

    public Classroom updateClassroom(Long id, String name, String description, User teacher) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        if (!classroom.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Forbidden");
        }
        classroom.setName(name);
        classroom.setDescription(description);
        return classroomRepository.save(classroom);
    }

    public void deleteClassroom(Long id, User teacher) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        if (!classroom.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Forbidden");
        }
        classroomRepository.delete(classroom);
    }

    public Optional<Classroom> findByJoinCode(String joinCode) {
        return classroomRepository.findByJoinCode(joinCode);
    }

    public Optional<Classroom> findById(Long id) {
        return classroomRepository.findById(id);
    }

    public List<Classroom> getTeacherClasses(User teacher) {
        return classroomRepository.findByTeacher(teacher);
    }
}
