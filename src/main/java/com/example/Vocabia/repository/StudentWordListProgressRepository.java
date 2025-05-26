// --- Custom Word List Game Mode START ---
package com.example.Vocabia.repository;

import com.example.Vocabia.entity.StudentWordListProgress;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.WordList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentWordListProgressRepository extends JpaRepository<StudentWordListProgress, Long> {
    List<StudentWordListProgress> findByStudentAndWordList(User student, WordList wordList);

    Optional<StudentWordListProgress> findByStudentAndWordListAndDayNumber(User student, WordList wordList,
            Integer dayNumber);
}
// --- Custom Word List Game Mode END ---
