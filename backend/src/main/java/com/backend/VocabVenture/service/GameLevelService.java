package com.backend.VocabVenture.service;

import com.backend.VocabVenture.exception.ResourceNotFoundException;
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
            loadLevelsFromFilesystem();
        } catch (IOException e) {
            System.err.println("Failed to load game levels from filesystem: " + e.getMessage());
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
                .orElseThrow(() -> new ResourceNotFoundException("Level not found for category: " + category + " and level: " + levelNumber));
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
                .orElseThrow(() -> new ResourceNotFoundException("Level not found with id: " + id));

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
                .orElseThrow(() -> new ResourceNotFoundException("Level not found with id: " + id));

        gameLevelRepository.delete(level);
    }

    public List<GameLevel> loadLevelsFromFilesystem() throws IOException {
        List<GameLevel> loadedLevels = new ArrayList<>();

        String[] categories = {"animals", "fruits"};

        for (String category : categories) {
            try {
                String basePath = "static/images/" + category + "/level1/";
                Resource answerRes = new ClassPathResource(basePath + "answer.txt");

                if (answerRes.exists()) {
                    String answer = new String(answerRes.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();

                    if (gameLevelRepository.findByCategoryAndLevelNumber(category, 1).isEmpty()) {
                        GameLevel level = new GameLevel();
                        level.setCategory(category);
                        level.setLevelNumber(1);
                        level.setAnswer(answer);
                        level.setImagesPath(category + "/level1");
                        level.setDifficulty(GameLevel.Difficulty.values()[1]);
                        level.setActive(true);

                        GameLevel savedLevel = gameLevelRepository.save(level);
                        loadedLevels.add(savedLevel);
                    }
                }
            } catch (Exception e) {
                System.out.println("Could not load level for category: " + category + ", error: " + e.getMessage());
            }
        }

        return loadedLevels;
    }
}