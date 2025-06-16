package com.example.Vocabia.service;

import com.example.Vocabia.entity.FourPicOneWord;
import com.example.Vocabia.repository.FourPicOneWordRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.Iterator;

@Service
@RequiredArgsConstructor
public class StaticImporterService {

    private final FourPicOneWordRepository fourPicOneWordRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void importPuzzles() {
        try {
            File staticFolder = new ClassPathResource("static/images").getFile();
            if (!staticFolder.exists()) {
                System.out.println("No static images folder found.");
                return;
            }

            File[] categories = staticFolder.listFiles(File::isDirectory);
            if (categories == null) return;

            for (File categoryFolder : categories) {
                String categoryName = categoryFolder.getName();

                File[] levelFolders = categoryFolder.listFiles(File::isDirectory);
                if (levelFolders == null) continue;

                for (File levelFolder : levelFolders) {
                    String levelName = levelFolder.getName();
                    File levelJson = new File(levelFolder, "level.json");

                    if (!levelJson.exists()) {
                        System.out.println("No level.json found for " + levelName);
                        continue;
                    }

                    JsonNode root = objectMapper.readTree(levelJson);
                    String answer = root.path("answer").asText();
                    String hint = root.path("hint").asText();
                    int difficultyCode = root.path("difficulty").asInt(1);

                    FourPicOneWord.Difficulty difficulty = switch (difficultyCode) {
                        case 2 -> FourPicOneWord.Difficulty.MEDIUM;
                        case 3 -> FourPicOneWord.Difficulty.HARD;
                        default -> FourPicOneWord.Difficulty.EASY;
                    };

                    Iterator<JsonNode> images = root.path("images").elements();
                    String[] imageUrls = new String[4];
                    int idx = 0;
                    while (images.hasNext() && idx < 4) {
                        imageUrls[idx++] = images.next().asText();
                    }

                    int levelNumber = extractLevelNumber(levelName);

                    if (fourPicOneWordRepository.findByCategoryAndLevel(categoryName, levelNumber).isPresent()) {
                        System.out.println("Puzzle already exists for " + categoryName + " Level " + levelNumber + ". Skipping...");
                        continue;
                    }

                    FourPicOneWord puzzle = FourPicOneWord.builder()
                            .category(categoryName)
                            .level(levelNumber)
                            .answer(answer)
                            .hint(hint)
                            .difficulty(difficulty)
                            .image1Url(imageUrls[0])
                            .image2Url(imageUrls[1])
                            .image3Url(imageUrls[2])
                            .image4Url(imageUrls[3])
                            .isActive(true)
                            .build();

                    fourPicOneWordRepository.save(puzzle);
                    System.out.println("Imported: " + categoryName + " Level " + levelNumber);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private int extractLevelNumber(String levelFolderName) {
        try {
            return Integer.parseInt(levelFolderName.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            return 1;
        }
    }
}
