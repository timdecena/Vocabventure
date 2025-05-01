package com.backend.VocabVenture.service;

import com.backend.VocabVenture.exception.ResourceNotFoundException;
import com.backend.VocabVenture.exception.UnauthorizedException;
import com.backend.VocabVenture.exception.BadRequestException;
import com.backend.VocabVenture.model.Class;
import com.backend.VocabVenture.model.Role;
import com.backend.VocabVenture.model.User;
import com.backend.VocabVenture.repository.ClassRepository;
import com.backend.VocabVenture.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ClassService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;

    @Autowired
    public ClassService(ClassRepository classRepository, UserRepository userRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }

    private String generateJoinCode() {
        String joinCode;
        do {
            joinCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } while (classRepository.existsByJoinCode(joinCode));
        return joinCode;
    }

    public Class createClass(String className, String description, Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + teacherId));

        if (teacher.getRole() != Role.TEACHER) {
            throw new UnauthorizedException("Only teachers can create classes");
        }

        Class newClass = new Class();
        newClass.setClassName(className);
        newClass.setDescription(description);
        newClass.setCreatedAt(LocalDateTime.now());
        newClass.setTeacher(teacher);
        newClass.setJoinCode(generateJoinCode());

        return classRepository.save(newClass);
    }

    public List<Class> getClassesByTeacherId(Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + teacherId));

        if (teacher.getRole() != Role.TEACHER) {
            throw new UnauthorizedException("Only teachers can view their classes");
        }

        return classRepository.findByTeacher(teacher);
    }

    public Class updateClass(Long classId, String newClassName, String newDescription, Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + teacherId));

        Class existingClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));

        if (!existingClass.getTeacher().getId().equals(teacher.getId())) {
            throw new UnauthorizedException("You are not authorized to update this class");
        }

        existingClass.setClassName(newClassName);
        existingClass.setDescription(newDescription);

        return classRepository.save(existingClass);
    }

    public void deleteClass(Long classId, Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + teacherId));

        Class existingClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));

        if (!existingClass.getTeacher().getId().equals(teacher.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this class");
        }

        classRepository.delete(existingClass);
    }

    public void joinClass(String joinCode, Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        if (student.getRole() != Role.STUDENT) {
            throw new UnauthorizedException("Only students can join classes");
        }

        Class classroom = classRepository.findByJoinCode(joinCode)
                .orElseThrow(() -> new BadRequestException("Invalid join code"));

        if (classroom.getTeacher().getId().equals(student.getId())) {
            throw new BadRequestException("Teachers cannot join their own class");
        }

        if (classroom.getStudents().contains(student)) {
            throw new BadRequestException("You have already joined this class");
        }

        classroom.getStudents().add(student);
        classRepository.save(classroom);
    }

    public Class getClassById(Long classId) {
        return classRepository.findByIdWithStudents(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + classId));
    }
}
