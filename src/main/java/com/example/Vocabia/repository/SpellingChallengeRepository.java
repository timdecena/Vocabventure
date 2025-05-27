package com.example.Vocabia.repository;

import com.example.Vocabia.entity.SpellingChallenge;
import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpellingChallengeRepository extends JpaRepository<SpellingChallenge, Long> {
    List<SpellingChallenge> findByTeacher(User teacher);
    List<SpellingChallenge> findByClassroom(Classroom classroom);
}
