package com.example.Vocabia.repository;

import com.example.Vocabia.entity.Classroom;
<<<<<<< HEAD
import com.example.Vocabia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    Optional<Classroom> findByJoinCode(String joinCode);
    List<Classroom> findByTeacher(User teacher);
=======
import com.example.Vocabia.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {
    List<Classroom> findByTeacher(UserEntity teacher);
>>>>>>> 9c235d03163cc3f9d8a9c7738f6667321e880070
}
