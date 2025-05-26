// --- Custom Word List Game Mode START ---
package com.example.Vocabia.repository;

import com.example.Vocabia.entity.WordListItem;
import com.example.Vocabia.entity.WordList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WordListItemRepository extends JpaRepository<WordListItem, Long> {
    List<WordListItem> findByWordListAndDayNumber(WordList wordList, Integer dayNumber);
}
// --- Custom Word List Game Mode END ---
