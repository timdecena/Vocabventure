// --- Custom Word List Game Mode START ---
package com.example.Vocabia.controller;

import com.example.Vocabia.entity.*;
import com.example.Vocabia.service.*;
import com.example.Vocabia.repository.*;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/wordlist/progress")
public class StudentWordListProgressController {
    private final StudentWordListProgressService progressService;
    private final UserRepository userRepository;
    private final WordListRepository wordListRepo;

    public StudentWordListProgressController(StudentWordListProgressService progressService,
            UserRepository userRepository, WordListRepository wordListRepo) {
        this.progressService = progressService;
        this.userRepository = userRepository;
        this.wordListRepo = wordListRepo;
    }

    // Student: submit progress for a day (with score)
    @PostMapping("/submit")
    public StudentWordListProgress submitProgress(@RequestBody ProgressDTO dto, Principal principal) {
        User student = userRepository.findByEmail(principal.getName()).orElseThrow();
        WordList wordList = wordListRepo.findById(dto.wordListId).orElseThrow();
        return progressService.submitProgress(student, wordList, dto.dayNumber, dto.score);
    }

    // DTO for progress submission
    public static class ProgressDTO {
        public Long wordListId;
        public Integer dayNumber;
        public Integer score;
    }
}
// --- Custom Word List Game Mode END ---
