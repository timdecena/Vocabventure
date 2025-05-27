package com.example.Vocabia.repository;

import com.example.Vocabia.entity.WordList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WordListRepository extends JpaRepository<WordList, Long> {
    List<WordList> findByCreatedById(Long teacherId);
}
