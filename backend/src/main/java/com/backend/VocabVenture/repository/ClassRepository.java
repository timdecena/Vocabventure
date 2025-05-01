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

    @Query("SELECT c FROM Class c LEFT JOIN FETCH c.students WHERE c.id = :classId")
    Optional<Class> findByIdWithStudents(@Param("classId") Long classId);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Class c WHERE c.joinCode = :joinCode")
    boolean existsByJoinCode(@Param("joinCode") String joinCode);
}
