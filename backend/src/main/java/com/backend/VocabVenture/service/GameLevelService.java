package com.backend.VocabVenture.service;

import com.backend.VocabVenture.model.GameLevel;
import com.backend.VocabVenture.repository.GameLevelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class GameLevelService {

    private final GameLevelRepository gameLevelRepository;
    


    @Autowired
    public GameLevelService(GameLevelRepository gameLevelRepository) {
        this.gameLevelRepository = gameLevelRepository;
    }

    @PostConstruct
    public void init() {
        try {
            loadLevelsFromInternalResources();
        } catch (IOException e) {
            System.err.println("Failed to load game levels from internal resources: " + e.getMessage());
        }
    }

    public List<String> getAllCategories() {
        return gameLevelRepository.findDistinctCategory();
    }

    public List<GameLevel> getLevelsByCategory(String category) {
        return gameLevelRepository.findByCategoryAndActiveTrueOrderByLevelNumber(category);
    }

    public GameLevel getLevel(String category, Integer levelNumber) {
        return gameLevelRepository.findByCategoryAndLevelNumber(category, levelNumber)
                .orElseThrow(() -> new com.backend.VocabVenture.exception.ResourceNotFoundException("Level not found for category: " + category + " and level: " + levelNumber));
    }

    public Map<String, Object> getLevelData(String category, Integer levelNumber) {
        GameLevel level = getLevel(category, levelNumber);

        List<String> imagePaths = level.getImagePaths();

        for (int i = 0; i < imagePaths.size(); i++) {
            System.out.println("Image URL " + (i + 1) + ": " + imagePaths.get(i));
        }

        List<Character> letterChoices = generateLetterChoices(level.getAnswer());

        Map<String, Object> levelData = new HashMap<>();
        levelData.put("id", level.getId());
        levelData.put("category", level.getCategory());
        levelData.put("levelNumber", level.getLevelNumber());
        levelData.put("answer", level.getAnswer());
        levelData.put("hint", level.getHint());
        levelData.put("difficulty", level.getDifficulty());
        levelData.put("images", imagePaths);
        levelData.put("letterChoices", letterChoices);

        return levelData;
    }

    private List<Character> generateLetterChoices(String answer) {
        List<Character> answerLetters = answer.chars()
                .mapToObj(c -> (char) c)
                .collect(Collectors.toList());

        String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        Random random = new Random();
        int extraLettersCount = Math.min(12 - answerLetters.size(), 8);

        for (int i = 0; i < extraLettersCount; i++) {
            char randomLetter = alphabet.charAt(random.nextInt(alphabet.length()));
            answerLetters.add(randomLetter);
        }

        Collections.shuffle(answerLetters);

        return answerLetters;
    }

    public GameLevel createLevel(GameLevel level) {
        return gameLevelRepository.save(level);
    }

    public GameLevel updateLevel(Long id, GameLevel levelDetails) {
        GameLevel level = gameLevelRepository.findById(id)
                .orElseThrow(() -> new com.backend.VocabVenture.exception.ResourceNotFoundException("Level not found with id: " + id));

        level.setCategory(levelDetails.getCategory());
        level.setLevelNumber(levelDetails.getLevelNumber());
        level.setAnswer(levelDetails.getAnswer());
        level.setImagesPath(levelDetails.getImagesPath());
        level.setHint(levelDetails.getHint());
        level.setDifficulty(levelDetails.getDifficulty());
        level.setActive(levelDetails.isActive());

        return gameLevelRepository.save(level);
    }

    public void deleteLevel(Long id) {
        GameLevel level = gameLevelRepository.findById(id)
                .orElseThrow(() -> new com.backend.VocabVenture.exception.ResourceNotFoundException("Level not found with id: " + id));
        gameLevelRepository.delete(level);
    }

    public List<GameLevel> loadLevelsFromFilesystem() throws IOException {
        // This method now only loads from internal resources
        return loadLevelsFromInternalResources();
    }
    
    private List<GameLevel> loadLevelsFromInternalResources() throws IOException {
        List<GameLevel> loadedLevels = new ArrayList<>();
        
        // Scan for categories and levels in the internal resources
        String[] categories = {"animals", "fruits", "vehicles"}; // Add your categories here
        
        for (String category : categories) {
            // Scan for multiple levels in each category
            for (int levelNumber = 1; levelNumber <= 10; levelNumber++) {
                try {
                    String basePath = "static/images/" + category + "/level" + levelNumber + "/";
                    Resource answerRes = new ClassPathResource(basePath + "answer.txt");
                    
                    if (answerRes.exists()) {
                        String answer = new String(answerRes.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
                        
                        // Check if this level already exists in the database
                        if (gameLevelRepository.findByCategoryAndLevelNumber(category, levelNumber).isEmpty()) {
                            GameLevel level = new GameLevel();
                            level.setCategory(category);
                            level.setLevelNumber(levelNumber);
                            level.setAnswer(answer);
                            level.setImagesPath(category + "/level" + levelNumber);
                            
                            // Try to load hint if it exists
                            try {
                                Resource hintRes = new ClassPathResource(basePath + "hint.txt");
                                if (hintRes.exists()) {
                                    String hint = new String(hintRes.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
                                    level.setHint(hint);
                                }
                            } catch (Exception e) {
                                // Hint file is optional, so continue if it doesn't exist
                                System.out.println("No hint file found for " + category + "/level" + levelNumber);
                            }
                            
                            // Set difficulty based on level number
                            if (levelNumber <= 3) {
                                level.setDifficulty(GameLevel.Difficulty.EASY);
                            } else if (levelNumber <= 7) {
                                level.setDifficulty(GameLevel.Difficulty.MEDIUM);
                            } else {
                                level.setDifficulty(GameLevel.Difficulty.HARD);
                            }
                            
                            level.setActive(true);
                            
                            GameLevel savedLevel = gameLevelRepository.save(level);
                            loadedLevels.add(savedLevel);
                            System.out.println("Loaded internal level " + levelNumber + " for category: " + category);
                        }
                    }
                } catch (Exception e) {
                    // This is expected for levels that don't exist yet
                    if (levelNumber == 1) {
                        System.out.println("Could not load internal level 1 for category: " + category + ", error: " + e.getMessage());
                    }
                }
            }
        }
        
        return loadedLevels;
    }
}