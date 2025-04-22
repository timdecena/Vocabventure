package com.backend.VocabVenture.repository;

import com.backend.VocabVenture.model.ClassEntity;
import com.backend.VocabVenture.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassRepository extends JpaRepository<ClassEntity, Long> {
    List<ClassEntity> findByTeacher(User teacher);
}
