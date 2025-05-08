package com.backend.VocabVenture.service;

import com.backend.VocabVenture.model.Class;
import com.backend.VocabVenture.model.Role;
import com.backend.VocabVenture.model.User;
import com.backend.VocabVenture.repository.ClassRepository;
import com.backend.VocabVenture.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClassService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;

    @Autowired
    public ClassService(ClassRepository classRepository, UserRepository userRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Class createClass(Class classObj, Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found"));
        
        if (teacher.getRole() != Role.TEACHER) {
            throw new AccessDeniedException("Only teachers can create classes");
        }
        
        classObj.setTeacher(teacher);
        classObj.setCreatedAt(LocalDateTime.now());
        classObj.setUpdatedAt(LocalDateTime.now());
        
        return classRepository.save(classObj);
    }

    @Transactional(readOnly = true)
    public List<Class> getTeacherClasses(Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new EntityNotFoundException("Teacher not found"));
        
        if (teacher.getRole() != Role.TEACHER) {
            throw new AccessDeniedException("User is not a teacher");
        }
        
        return classRepository.findByTeacher(teacher);
    }

    @Transactional(readOnly = true)
    public List<Class> getStudentClasses(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        
        if (student.getRole() != Role.STUDENT) {
            throw new AccessDeniedException("User is not a student");
        }
        
        return classRepository.findClassesByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public Class getClassById(Long classId) {
        return classRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Class not found"));
    }

    @Transactional
    public Class updateClass(Long classId, Class updatedClass, Long teacherId) {
        Class existingClass = classRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Class not found"));
        
        // Verify the teacher owns this class
        if (!existingClass.getTeacher().getId().equals(teacherId)) {
            throw new AccessDeniedException("You don't have permission to update this class");
        }
        
        existingClass.setClassName(updatedClass.getClassName());
        existingClass.setDescription(updatedClass.getDescription());
        existingClass.setUpdatedAt(LocalDateTime.now());
        
        return classRepository.save(existingClass);
    }

    @Transactional
    public void deleteClass(Long classId, Long teacherId) {
        Class classToDelete = classRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Class not found"));
        
        // Verify the teacher owns this class
        if (!classToDelete.getTeacher().getId().equals(teacherId)) {
            throw new AccessDeniedException("You don't have permission to delete this class");
        }
        
        classRepository.delete(classToDelete);
    }

    @Transactional
    public Class joinClass(String joinCode, Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        
        if (student.getRole() != Role.STUDENT) {
            throw new AccessDeniedException("Only students can join classes");
        }
        
        Class classToJoin = classRepository.findByJoinCode(joinCode)
                .orElseThrow(() -> new EntityNotFoundException("Invalid join code"));
        
        // Check if student is already in the class
        if (classToJoin.getStudents().contains(student)) {
            throw new IllegalStateException("Student is already in this class");
        }
        
        classToJoin.addStudent(student);
        classToJoin.setUpdatedAt(LocalDateTime.now());
        
        return classRepository.save(classToJoin);
    }

    @Transactional
    public Class removeStudentFromClass(Long classId, Long studentId, Long teacherId) {
        Class classObj = classRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Class not found"));
        
        // Verify the teacher owns this class
        if (!classObj.getTeacher().getId().equals(teacherId)) {
            throw new AccessDeniedException("You don't have permission to modify this class");
        }
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        
        if (!classObj.getStudents().contains(student)) {
            throw new IllegalStateException("Student is not in this class");
        }
        
        classObj.removeStudent(student);
        classObj.setUpdatedAt(LocalDateTime.now());
        
        return classRepository.save(classObj);
    }

    @Transactional
    public Class regenerateJoinCode(Long classId, Long teacherId) {
        Class classObj = classRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Class not found"));
        
        // Verify the teacher owns this class
        if (!classObj.getTeacher().getId().equals(teacherId)) {
            throw new AccessDeniedException("You don't have permission to modify this class");
        }
        
        classObj.regenerateJoinCode();
        
        return classRepository.save(classObj);
    }

    @Transactional(readOnly = true)
    public boolean isValidJoinCode(String joinCode) {
        return classRepository.existsByJoinCode(joinCode);
    }
}
