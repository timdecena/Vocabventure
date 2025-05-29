// service/FourPicOneWordAssetService.java
package com.example.Vocabia.service;

import com.example.Vocabia.dto.FourPicOneWordPuzzleDTO;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class FourPicOneWordAssetService {

    private static final String BASE_DIR = "static/images/";

    public List<String> getAllCategories() {
        try {
            File baseDir = new ClassPathResource(BASE_DIR).getFile();
            File[] directories = baseDir.listFiles(File::isDirectory);
            List<String> categories = new ArrayList<>();
            if (directories != null) {
                for (File dir : directories) {
                    categories.add(dir.getName());
                }
            }
            return categories;
        } catch (IOException e) {
            throw new RuntimeException("Failed to list categories", e);
        }
    }

    public List<String> getLevelsForCategory(String category) {
        try {
            File categoryDir = new ClassPathResource(BASE_DIR + category + "/").getFile();
            File[] directories = categoryDir.listFiles(File::isDirectory);
            List<String> levels = new ArrayList<>();
            if (directories != null) {
                for (File dir : directories) {
                    levels.add(dir.getName());
                }
            }
            return levels;
        } catch (IOException e) {
            throw new RuntimeException("Failed to list levels for category " + category, e);
        }
    }

    public FourPicOneWordPuzzleDTO loadFourPicOneWord(String category, String level) {
        String basePath = BASE_DIR + category + "/" + level + "/";
        try {
            String answer = readTextFile(basePath + "answer.txt").toUpperCase();
            String hint = readTextFile(basePath + "hint.txt");

            // Collect images
            List<String> images = new ArrayList<>();
            File levelDir = new ClassPathResource(basePath).getFile();
            File[] imageFiles = levelDir.listFiles((dir, name) -> name.toLowerCase().matches("pic\\d+\\.jpg"));
            if (imageFiles != null) {
                Arrays.sort(imageFiles, Comparator.comparing(File::getName));
                for (File img : imageFiles) {
                    images.add("/images/" + category + "/" + level + "/" + img.getName());
                }
            }

            List<String> letterTiles = generateLetterTiles(answer);

            FourPicOneWordPuzzleDTO dto = new FourPicOneWordPuzzleDTO(answer, hint, images);
            dto.setLetterTiles(letterTiles);
            return dto;
        } catch (Exception e) {
            throw new RuntimeException("Failed to load puzzle for category=" + category + ", level=" + level, e);
        }
    }

    private String readTextFile(String classPath) {
        try {
            ClassPathResource res = new ClassPathResource(classPath);
            if (!res.exists()) return "";
            try (InputStream is = res.getInputStream()) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8).trim();
            }
        } catch (Exception e) {
            return "";
        }
    }

    private List<String> generateLetterTiles(String answer) {
        String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        List<String> tiles = new ArrayList<>();
        for (char c : answer.toCharArray()) tiles.add(String.valueOf(c));
        Random rnd = new Random();
        while (tiles.size() < 12) {
            tiles.add(String.valueOf(alphabet.charAt(rnd.nextInt(alphabet.length()))));
        }
        Collections.shuffle(tiles);
        return tiles;
    }
}
