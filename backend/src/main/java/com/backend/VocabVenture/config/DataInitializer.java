package com.backend.VocabVenture.config;

import com.backend.VocabVenture.model.GameLevel;
import com.backend.VocabVenture.repository.GameLevelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final GameLevelRepository gameLevelRepository;

    @Autowired
    public DataInitializer(GameLevelRepository gameLevelRepository) {
        this.gameLevelRepository = gameLevelRepository;
    }

    @Override
    public void run(String... args) {
        // Create sample levels that don't already exist
        createSampleGameLevels();
    }

    private void createSampleGameLevels() {
        List<GameLevel> gameLevels = new ArrayList<>();

        // Animals category - 5 levels
        createLevelIfNotExists(gameLevels, "animals", 1, "PANDA", "Black and white bear from China", 1);
        createLevelIfNotExists(gameLevels, "animals", 2, "TIGER", "Big cat with stripes", 1);
        createLevelIfNotExists(gameLevels, "animals", 3, "ELEPHANT", "Largest land mammal with a trunk", 2);
        createLevelIfNotExists(gameLevels, "animals", 4, "GIRAFFE", "Tallest animal with a long neck", 2);
        createLevelIfNotExists(gameLevels, "animals", 5, "PENGUIN", "Flightless bird that lives in cold regions", 3);

        // Fruits category - 5 levels
        createLevelIfNotExists(gameLevels, "fruits", 1, "APPLE", "Red or green fruit that keeps the doctor away", 1);
        createLevelIfNotExists(gameLevels, "fruits", 2, "BANANA", "Yellow curved fruit", 1);
        createLevelIfNotExists(gameLevels, "fruits", 3, "ORANGE", "Citrus fruit named after its color", 2);
        createLevelIfNotExists(gameLevels, "fruits", 4, "GRAPES", "Small round fruits that grow in clusters", 2);
        createLevelIfNotExists(gameLevels, "fruits", 5, "WATERMELON", "Large green fruit with red flesh and black seeds", 3);

        // Save all game levels if any were created
        if (!gameLevels.isEmpty()) {
            gameLevelRepository.saveAll(gameLevels);
            System.out.println("Created " + gameLevels.size() + " new game levels");
        } else {
            System.out.println("All game levels already exist");
        }
    }

    private void createLevelIfNotExists(List<GameLevel> levels, String category, int levelNumber, String answer, String hint, int difficulty) {
        // Check if this level already exists in the database
        if (gameLevelRepository.findByCategoryAndLevelNumber(category, levelNumber).isEmpty()) {
            // Level doesn't exist, create it
            GameLevel level = new GameLevel();
            level.setCategory(category);
            level.setLevelNumber(levelNumber);
            level.setAnswer(answer);
            level.setImagesPath(category + "/level" + levelNumber);
            level.setHint(hint);
            level.setDifficulty(GameLevel.Difficulty.values()[difficulty - 1]);
            level.setActive(true);
            levels.add(level);
            System.out.println("Adding new level: " + category + " level " + levelNumber);
        } else {
            System.out.println("Level already exists: " + category + " level " + levelNumber);
        }
    }

    private void createAndAddLevel(List<GameLevel> levels, String category, int levelNumber, String answer, String hint, int difficulty) {
        GameLevel level = new GameLevel();
        level.setCategory(category);
        level.setLevelNumber(levelNumber);
        level.setAnswer(answer);
        level.setImagesPath(category + "/level" + levelNumber);
        level.setHint(hint);
        level.setDifficulty(GameLevel.Difficulty.values()[difficulty - 1]);
        level.setActive(true);
        levels.add(level);
    }
}