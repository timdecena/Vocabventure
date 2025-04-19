package com.backend.VocabVenture;

import com.backend.VocabVenture.model.*;
import com.backend.VocabVenture.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final AdventureLevelRepository levelRepo;
    private final AdventureWordRepository wordRepo;

    @Override
    public void run(String... args) throws Exception {
        if (levelRepo.count() == 0) {
            AdventureLevel level = AdventureLevel.builder()
                    .levelNumber(1)
                    .title("Beginner's Forest")
                    .description("Face the Forest Goblin")
                    .monsterName("Forest Goblin")
                    .monsterImageUrl("/images/goblin.png")
                    .difficulty("easy")
                    .monsterHP(3)
                    .teacherId(1L) // Sample teacher ID
                    .build();
            levelRepo.save(level);

            List<String> words = List.of("apple", "banana", "cherry");
            words.forEach(w -> wordRepo.save(
                    AdventureWord.builder()
                            .word(w)
                            .levelId(level.getLevelId())
                            .createdByTeacherId(1L)
                            .build()
            ));
        }
    }
}
