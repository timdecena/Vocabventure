package com.backend.VocabVenture.repository;
import com.backend.VocabVenture.model.AdventureWord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdventureWordRepository extends JpaRepository<AdventureWord, Long> {
    List<AdventureWord> findByLevelId(Long levelId);
}
