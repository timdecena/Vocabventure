package com.backend.VocabVenture.service;

import com.backend.VocabVenture.model.Class;
import com.backend.VocabVenture.model.ClassJoinRequest;
import com.backend.VocabVenture.model.Role;
import com.backend.VocabVenture.model.User;
import com.backend.VocabVenture.repository.ClassJoinRequestRepository;
import com.backend.VocabVenture.repository.ClassRepository;
import com.backend.VocabVenture.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ClassService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final ClassJoinRequestRepository joinRequestRepository;

    @Autowired
    public ClassService(ClassRepository classRepository, UserRepository userRepository,
                        ClassJoinRequestRepository joinRequestRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.joinRequestRepository = joinRequestRepository;
    }

@Transactional
public Class createClass(Class classObj, Long teacherId) {
    User teacher = getTeacher(teacherId);
    classObj.setTeacher(teacher);
    classObj.setCreatedAt(LocalDateTime.now());
    classObj.setUpdatedAt(LocalDateTime.now());

    // Ensure unique join code
    String joinCode;
    do {
        joinCode = generateUniqueJoinCode();
    } while (classRepository.existsByJoinCode(joinCode));
    classObj.setJoinCode(joinCode);

    return classRepository.save(classObj);
}

@Transactional
public Class regenerateJoinCode(Long classId, Long teacherId) {
    Class classObj = getClassOwnedByTeacher(classId, teacherId);

    String newJoinCode;
    do {
        newJoinCode = generateUniqueJoinCode();
    } while (classRepository.existsByJoinCode(newJoinCode));

    classObj.setJoinCode(newJoinCode);
    classObj.setUpdatedAt(LocalDateTime.now());
    return classRepository.save(classObj);
}

private String generateUniqueJoinCode() {
    return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
}

    @Transactional(readOnly = true)
    public List<Class> getTeacherClasses(Long teacherId) {
        User teacher = getTeacher(teacherId);
        return classRepository.findByTeacher(teacher);
    }

    @Transactional(readOnly = true)
    public List<Class> getStudentClasses(Long studentId) {
        User student = getStudent(studentId);
        return classRepository.findClassesByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public Class getClassById(Long classId) {
        return classRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Class not found"));
    }

    @Transactional
    public Class updateClass(Long classId, Class updatedClass, Long teacherId) {
        Class existingClass = getClassOwnedByTeacher(classId, teacherId);
        existingClass.setClassName(updatedClass.getClassName());
        existingClass.setDescription(updatedClass.getDescription());
        existingClass.setUpdatedAt(LocalDateTime.now());
        return classRepository.save(existingClass);
    }

    @Transactional
    public void deleteClass(Long classId, Long teacherId) {
        Class classObj = getClassOwnedByTeacher(classId, teacherId);
        classRepository.delete(classObj);
    }

    /**
     * STUDENT requests to join class by join code (creates a pending request)
     */
    @Transactional
    public void requestToJoinClass(String joinCode, Long studentId) {
        User student = getStudent(studentId);
        Class classToJoin = classRepository.findByJoinCode(joinCode)
                .orElseThrow(() -> new EntityNotFoundException("Invalid join code"));

        // Check if already a student
        if (classToJoin.getStudents().contains(student)) {
            throw new IllegalStateException("You are already enrolled in this class.");
        }

        // Check if already requested
        boolean exists = joinRequestRepository.existsByStudentAndClassObj(student, classToJoin);
        if (exists) {
            throw new IllegalStateException("You have already requested to join this class.");
        }

        ClassJoinRequest request = new ClassJoinRequest();
        request.setStudent(student);
        request.setClassObj(classToJoin);
        request.setApproved(false);
        joinRequestRepository.save(request);
    }

    /**
     * TEACHER views pending join requests for their class
     */
    @Transactional(readOnly = true)
    public List<ClassJoinRequest> getPendingJoinRequests(Long classId, Long teacherId) {
        Class classObj = getClassOwnedByTeacher(classId, teacherId);
        return joinRequestRepository.findByClassObjAndApprovedFalse(classObj);
    }

    /**
     * TEACHER approves student request, adds to class
     */
    @Transactional
    public void approveJoinRequest(Long requestId, Long teacherId) {
        ClassJoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Join request not found"));

        Class classObj = request.getClassObj();

        if (!classObj.getTeacher().getId().equals(teacherId)) {
            throw new AccessDeniedException("You are not the teacher of this class.");
        }

        if (request.isApproved()) {
            throw new IllegalStateException("Request already approved.");
        }

        // Add student to class
        classObj.addStudent(request.getStudent());
        request.setApproved(true);

        joinRequestRepository.save(request);
        classRepository.save(classObj);
    }

    @Transactional
    public Class removeStudentFromClass(Long classId, Long studentId, Long teacherId) {
        Class classObj = getClassOwnedByTeacher(classId, teacherId);
        User student = getStudent(studentId);

        if (!classObj.getStudents().contains(student)) {
            throw new IllegalStateException("Student is not in this class");
        }

        classObj.removeStudent(student);
        classObj.setUpdatedAt(LocalDateTime.now());

        return classRepository.save(classObj);
    }


    @Transactional(readOnly = true)
    public boolean isValidJoinCode(String joinCode) {
        return classRepository.existsByJoinCode(joinCode);
    }

    // ======================== Utility Methods ==========================

    private User getTeacher(Long teacherId) {
        User user = userRepository.findById(teacherId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getRole() != Role.TEACHER) {
            throw new AccessDeniedException("User is not a teacher");
        }
        return user;
    }

    private User getStudent(Long studentId) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (user.getRole() != Role.STUDENT) {
            throw new AccessDeniedException("User is not a student");
        }
        return user;
    }

    private Class getClassOwnedByTeacher(Long classId, Long teacherId) {
        Class classObj = classRepository.findById(classId)
                .orElseThrow(() -> new EntityNotFoundException("Class not found"));

        if (!classObj.getTeacher().getId().equals(teacherId)) {
            throw new AccessDeniedException("You don’t have permission to access this class");
        }

        return classObj;
    }
}
