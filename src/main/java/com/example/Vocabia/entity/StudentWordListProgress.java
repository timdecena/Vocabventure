// --- Custom Word List Game Mode START ---
package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentWordListProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne
    @JoinColumn(name = "word_list_id")
    private WordList wordList;

    private Integer dayNumber; // 1-7 (Mon-Sun)
    private boolean completed;
    private LocalDate dateCompleted;
    private Integer score; // optional, if you want to track quiz score
}
// --- Custom Word List Game Mode END ---
