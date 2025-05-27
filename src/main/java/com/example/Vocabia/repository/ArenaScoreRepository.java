package com.example.Vocabia.repository;

import com.example.Vocabia.entity.ArenaScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArenaScoreRepository extends JpaRepository<ArenaScore, Long> {
    List<ArenaScore> findByWordListIdOrderByTotalScoreDesc(Long wordListId);
}
