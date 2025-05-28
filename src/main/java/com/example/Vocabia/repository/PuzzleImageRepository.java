package com.example.Vocabia.repository;

import com.example.Vocabia.entity.PuzzleImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PuzzleImageRepository extends JpaRepository<PuzzleImage, Long> {
    List<PuzzleImage> findByPuzzle_Id(Long puzzleId);
}
