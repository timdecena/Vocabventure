// --- Custom Word List Game Mode START ---
package com.example.Vocabia.service;

import com.example.Vocabia.entity.*;
import com.example.Vocabia.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class StudentWordListProgressService {
    private final StudentWordListProgressRepository progressRepo;

    public StudentWordListProgressService(StudentWordListProgressRepository progressRepo) {
        this.progressRepo = progressRepo;
    }

    public StudentWordListProgress submitProgress(User student, WordList wordList, Integer dayNumber, Integer score) {
        Optional<StudentWordListProgress> opt = progressRepo.findByStudentAndWordListAndDayNumber(student, wordList,
                dayNumber);
        StudentWordListProgress progress = opt
                .orElse(new StudentWordListProgress(null, student, wordList, dayNumber, false, null, null));
        progress.setCompleted(true);
        progress.setDateCompleted(LocalDate.now());
        progress.setScore(score);
        return progressRepo.save(progress);
    }
}
// --- Custom Word List Game Mode END ---
