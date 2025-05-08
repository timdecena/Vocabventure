package com.backend.VocabVenture.repository;

import com.backend.VocabVenture.model.Class;
import com.backend.VocabVenture.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<Class, Long> {
    
    List<Class> findByTeacher(User teacher);
    
    Optional<Class> findByJoinCode(String joinCode);
    
    @Query("SELECT c FROM Class c JOIN c.students s WHERE s.id = :studentId")
    List<Class> findClassesByStudentId(@Param("studentId") Long studentId);
    
    boolean existsByJoinCode(String joinCode);
}
