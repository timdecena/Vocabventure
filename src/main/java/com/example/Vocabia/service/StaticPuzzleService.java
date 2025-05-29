package com.example.Vocabia.service;

import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.Level;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StaticPuzzleService {
    private final FourPicOneWordPuzzleService puzzleService;
    private final LevelService levelService;
    private final String STATIC_IMAGES_PATH = "static/images";

    public StaticPuzzleService(FourPicOneWordPuzzleService puzzleService, LevelService levelService) {
        this.puzzleService = puzzleService;
        this.levelService = levelService;
    }

    @Transactional
    public String syncStaticPuzzles() {
        try {
            Path basePath = Paths.get(STATIC_IMAGES_PATH);
            if (!Files.exists(basePath)) {
                return "Static images directory not found!";
            }

            // Get categories (immediate subdirectories)
            List<Path> categories = Files.list(basePath)
                .filter(Files::isDirectory)
                .collect(Collectors.toList());

            int totalPuzzles = 0;
            StringBuilder report = new StringBuilder();

            for (Path categoryPath : categories) {
                String category = categoryPath.getFileName().toString();
                report.append("Processing category: ").append(category).append("\n");

                // Get level directories
                List<Path> levels = Files.list(categoryPath)
                    .filter(Files::isDirectory)
                    .collect(Collectors.toList());

                for (Path levelPath : levels) {
                    String levelName = levelPath.getFileName().toString();
                    Level level = levelService.findOrCreateLevel(category, levelName);

                    // Get puzzle directories
                    List<Path> puzzleDirs = Files.list(levelPath)
                        .filter(Files::isDirectory)
                        .collect(Collectors.toList());

                    for (Path puzzleDir : puzzleDirs) {
                        String answer = puzzleDir.getFileName().toString();
                        List<String> images = Files.list(puzzleDir)
                            .filter(p -> p.toString().toLowerCase().endsWith(".jpg") || 
                                       p.toString().toLowerCase().endsWith(".png"))
                            .map(p -> p.toString().replace(STATIC_IMAGES_PATH + File.separator, ""))
                            .collect(Collectors.toList());

                        if (images.size() == 4) {
                            FourPicOneWordPuzzle puzzle = new FourPicOneWordPuzzle();
                            puzzle.setAnswer(answer);
                            puzzle.setLevel(level);
                            puzzle.setImages(images);
                            puzzle.setHint(""); // Can be updated later by teachers
                            
                            puzzleService.savePuzzle(puzzle);
                            totalPuzzles++;
                        }
                    }
                }
            }

            return String.format("Successfully synced %d puzzles across %d categories\n%s", 
                totalPuzzles, categories.size(), report.toString());

        } catch (Exception e) {
            return "Error syncing puzzles: " + e.getMessage();
        }
    }
}
