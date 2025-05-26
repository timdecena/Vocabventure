// --- Custom Word List Game Mode START ---
package com.example.Vocabia.controller;

import com.example.Vocabia.entity.*;
import com.example.Vocabia.service.*;
import com.example.Vocabia.repository.*;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/wordlist")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class WordListController {
    private final WordListService wordListService;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    public WordListController(WordListService wordListService, ClassroomRepository classroomRepository,
            UserRepository userRepository) {
        this.wordListService = wordListService;
        this.classroomRepository = classroomRepository;
        this.userRepository = userRepository;
    }

    // Teacher: create new word list
    @PostMapping("/create")
    public WordList createWordList(@RequestBody WordList wordList, Principal principal) {
        System.out.println("Current user: " + principal.getName());
        // Fetch classroom by ID
        Long classroomId = wordList.getClassroom().getId();
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        wordList.setClassroom(classroom);

        // (Optional) Also, set the wordList for each item if your JPA mapping requires
        // it
        if (wordList.getItems() != null) {
            for (WordListItem item : wordList.getItems()) {
                item.setWordList(wordList);
            }
        }

        return wordListService.createWordList(wordList);
    }

    // Teacher: get all word lists for a class
    @GetMapping("/class/{classId}")
    public List<WordList> getWordListsByClass(@PathVariable Long classId) {
        Classroom classroom = classroomRepository.findById(classId).orElseThrow();
        return wordListService.getWordListsByClassroom(classroom);
    }

    // Student: get today's word list items for their class (by week/day)
    @GetMapping("/student/{classId}/week/{weekNumber}/day/{dayNumber}")
    public List<WordListItem> getStudentWordListForDay(
            @PathVariable Long classId,
            @PathVariable Integer weekNumber,
            @PathVariable Integer dayNumber) {
        Classroom classroom = classroomRepository.findById(classId).orElseThrow();
        List<WordList> wordLists = wordListService.getWordListsByClassroom(classroom);
        // TEMP: Return all items for the first word list (for debugging)
        return wordLists.get(0).getItems();
    }
}
// --- Custom Word List Game Mode END ---
