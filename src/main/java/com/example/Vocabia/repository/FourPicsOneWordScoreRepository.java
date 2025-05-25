package com.example.Vocabia.repository;

import com.example.Vocabia.entity.FourPicsOneWordScore;
import com.example.Vocabia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FourPicsOneWordScoreRepository extends JpaRepository<FourPicsOneWordScore, Long> {
    List<FourPicsOneWordScore> findByStudent(User student);
    List<FourPicsOneWordScore> findByLevel_Classroom_Id(Long classroomId);
}
