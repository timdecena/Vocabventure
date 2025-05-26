// --- Custom Word List Game Mode START ---
package com.example.Vocabia.repository;

import com.example.Vocabia.entity.WordList;
import com.example.Vocabia.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WordListRepository extends JpaRepository<WordList, Long> {
    List<WordList> findByClassroom(Classroom classroom);
}
// --- Custom Word List Game Mode END ---
