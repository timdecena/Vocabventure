// --- Custom Word List Game Mode START ---
package com.example.Vocabia.service;

import com.example.Vocabia.entity.*;
import com.example.Vocabia.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WordListService {
    private final WordListRepository wordListRepo;
    private final WordListItemRepository wordListItemRepo;

    public WordListService(WordListRepository wordListRepo, WordListItemRepository wordListItemRepo) {
        this.wordListRepo = wordListRepo;
        this.wordListItemRepo = wordListItemRepo;
    }

    public WordList createWordList(WordList wordList) {
        return wordListRepo.save(wordList);
    }

    public List<WordList> getWordListsByClassroom(Classroom classroom) {
        return wordListRepo.findByClassroom(classroom);
    }

    public List<WordListItem> getItemsForDay(WordList wordList, Integer dayNumber) {
        return wordListItemRepo.findByWordListAndDayNumber(wordList, dayNumber);
    }
}
// --- Custom Word List Game Mode END ---
