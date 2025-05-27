package com.example.Vocabia.repository;

import com.example.Vocabia.entity.WordListItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WordListItemRepository extends JpaRepository<WordListItem, Long> {
    List<WordListItem> findByWordListId(Long wordListId);
}
