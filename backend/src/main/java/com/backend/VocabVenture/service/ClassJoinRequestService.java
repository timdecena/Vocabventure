package com.backend.VocabVenture.service;

import com.backend.VocabVenture.model.Class;
import com.backend.VocabVenture.model.ClassJoinRequest;
import com.backend.VocabVenture.model.User;
import com.backend.VocabVenture.repository.ClassJoinRequestRepository;
import com.backend.VocabVenture.repository.ClassRepository;
import com.backend.VocabVenture.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ClassJoinRequestService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final ClassJoinRequestRepository requestRepository;

    @Autowired
    public ClassJoinRequestService(ClassRepository classRepository,
                                   UserRepository userRepository,
                                   ClassJoinRequestRepository requestRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
    }

    public ClassJoinRequest submitJoinRequest(String joinCode, Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));

        Class classObj = classRepository.findByJoinCode(joinCode)
                .orElseThrow(() -> new EntityNotFoundException("Invalid join code"));

        if (requestRepository.existsByStudentAndClassObj(student, classObj)) {
            throw new IllegalStateException("Join request already submitted");
        }

        ClassJoinRequest request = new ClassJoinRequest();
        request.setClassObj(classObj);
        request.setApproved(false);

        return requestRepository.save(request);
    }

    // Add more methods later for approve/reject
}

