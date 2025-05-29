package com.example.Vocabia.repository;

import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.Level;
import com.example.Vocabia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository for FourPicOneWordPuzzle entities.
 */
public interface FourPicOneWordPuzzleRepository extends JpaRepository<FourPicOneWordPuzzle, Long> {
    
    /**
     * Find all puzzles for a specific level.
     */
    List<FourPicOneWordPuzzle> findByLevel(Level level);
    
    /**
     * Find all puzzles for a specific level ID.
     */
    List<FourPicOneWordPuzzle> findByLevel_Id(Long levelId);
    
    /**
     * Find all puzzles created by a specific teacher.
     */
    List<FourPicOneWordPuzzle> findByCreatedBy(User teacher);
    
    /**
     * Count all puzzles in the system.
     * @return total count of puzzles
     */
    long count();
}

