package com.example.Vocabia.service;

import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.Level;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.ClassroomRepository;
import com.example.Vocabia.repository.FourPicOneWordPuzzleRepository;
import com.example.Vocabia.repository.LevelRepository;
import com.example.Vocabia.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.util.*;

@Service
public class StartupPuzzleImporter {

    private final LevelRepository levelRepo;
    private final FourPicOneWordPuzzleRepository puzzleRepo;
    private final ClassroomRepository classroomRepo;
    private final UserRepository userRepo;

    public StartupPuzzleImporter(
            LevelRepository levelRepo,
            FourPicOneWordPuzzleRepository puzzleRepo,
            ClassroomRepository classroomRepo,
            UserRepository userRepo
    ) {
        this.levelRepo = levelRepo;
        this.puzzleRepo = puzzleRepo;
        this.classroomRepo = classroomRepo;
        this.userRepo = userRepo;
    }

    @PostConstruct
    public void importStaticPuzzlesToDB() {
        // --- 1. Find or create a default teacher
        User teacher = userRepo.findByEmail("admin@global.com").orElseGet(() -> {
            User u = new User();
            u.setEmail("admin@global.com");
            u.setFirstName("Global");
            u.setLastName("Admin");
            u.setPassword("{noop}admin"); // Don't use {noop} in production!
            u.setRole("TEACHER");
            return userRepo.save(u);
        });

        // --- 2. Find or create a "Global Puzzles" classroom
        Classroom classroom = classroomRepo.findByName("Global Puzzles")
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    Classroom c = new Classroom();
                    c.setName("Global Puzzles");
                    c.setDescription("Static imported puzzles for all users.");
                    c.setJoinCode(UUID.randomUUID().toString().substring(0, 8));
                    c.setTeacher(teacher);
                    return classroomRepo.save(c);
                });

        String baseDirPath = "src/main/resources/static/images";
        File baseDir = new File(baseDirPath);
        if (!baseDir.exists() || !baseDir.isDirectory()) return;

        int count = 0;

        for (File categoryDir : Objects.requireNonNull(baseDir.listFiles(File::isDirectory))) {
            String category = categoryDir.getName();
            for (File levelDir : Objects.requireNonNull(categoryDir.listFiles(File::isDirectory))) {
                String levelName = levelDir.getName();
                String answer = null;
                String hint = null;
                List<String> images = new ArrayList<>();

                // -- Try level.json first
                File jsonFile = new File(levelDir, "level.json");
                if (jsonFile.exists()) {
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode node = mapper.readTree(jsonFile);
                        answer = node.path("answer").asText().trim().toUpperCase();
                        hint = node.path("hint").asText();
                        for (JsonNode imgNode : node.withArray("images")) {
                            images.add(imgNode.asText());
                        }
                    } catch (Exception ignored) {}
                }

                // -- Fallback to txt files
                if (answer == null || answer.isEmpty()) {
                    answer = readTextFile(new File(levelDir, "answer.txt")).toUpperCase();
                }
                if (hint == null || hint.isEmpty()) {
                    hint = readTextFile(new File(levelDir, "hint.txt"));
                }
                if (images.isEmpty()) {
                    for (int i = 1; i <= 4; i++) {
                        File img = new File(levelDir, "pic" + i + ".jpg");
                        if (img.exists()) {
                            images.add("/images/" + category + "/" + levelName + "/" + img.getName());
                        }
                    }
                }

                // -- Require all fields
                if (answer.isEmpty() || images.size() < 4) continue;

                // -- Create or find Level -- must set classroom & teacher!
                Level level = levelRepo.findAll().stream()
                        .filter(l -> l.getName().equalsIgnoreCase(levelName)
                                && l.getDescription() != null
                                && l.getDescription().equalsIgnoreCase(category)
                                && l.getClassroom() != null
                                && l.getClassroom().getId().equals(classroom.getId()))
                        .findFirst()
                        .orElseGet(() -> {
                            Level newLevel = new Level();
                            newLevel.setName(levelName);
                            newLevel.setDescription(category);
                            newLevel.setNumber(0);
                            newLevel.setClassroom(classroom);
                            newLevel.setTeacher(teacher);
                            return levelRepo.save(newLevel);
                        });

                final String finalAnswer = answer;
                boolean exists = puzzleRepo.findByLevel(level).stream()
                        .anyMatch(p -> p.getAnswer().equalsIgnoreCase(finalAnswer));
                if (exists) continue;

                FourPicOneWordPuzzle puzzle = new FourPicOneWordPuzzle();
                puzzle.setLevel(level);
                puzzle.setAnswer(answer);
                puzzle.setHint(hint);
                puzzle.setImages(images);

                puzzleRepo.save(puzzle);
                count++;
            }
        }
        System.out.println("Imported " + count + " puzzles into the database.");
    }

    private String readTextFile(File file) {
        try {
            return Files.readString(file.toPath()).trim();
        } catch (Exception e) {
            return "";
        }
    }
}
