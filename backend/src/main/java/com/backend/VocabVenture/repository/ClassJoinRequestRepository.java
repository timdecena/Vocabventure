package com.backend.VocabVenture.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.VocabVenture.model.Class;
import com.backend.VocabVenture.model.ClassJoinRequest;
import com.backend.VocabVenture.model.User;

public interface ClassJoinRequestRepository extends JpaRepository<ClassJoinRequest, Long> {
    boolean existsByStudentAndClassObj(User student, Class classObj);
    List<ClassJoinRequest> findByClassObjAndApprovedFalse(Class classObj);
}
