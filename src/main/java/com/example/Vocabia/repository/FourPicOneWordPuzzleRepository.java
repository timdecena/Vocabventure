package com.example.Vocabia.repository;

import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FourPicOneWordPuzzleRepository extends JpaRepository<FourPicOneWordPuzzle, Long> {
    List<FourPicOneWordPuzzle> findByLevel(Level level);
    List<FourPicOneWordPuzzle> findByLevel_Id(Long levelId);
}

