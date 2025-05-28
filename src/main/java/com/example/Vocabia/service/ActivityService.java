package com.example.Vocabia.service;

import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.Level;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ActivityService {
    private final LevelRepository levelRepo;
    private final FourPicOneWordPuzzleRepository puzzleRepo;
    private final ClassroomRepository classroomRepo;
    private final UserRepository userRepo;

    public ActivityService(LevelRepository levelRepo,
                           FourPicOneWordPuzzleRepository puzzleRepo,
                           ClassroomRepository classroomRepo,
                           UserRepository userRepo) {
        this.levelRepo = levelRepo;
        this.puzzleRepo = puzzleRepo;
        this.classroomRepo = classroomRepo;
        this.userRepo = userRepo;
    }

    public Level createLevel(String name, String description, Integer number, Long classroomId, String teacherEmail) {
        Level level = new Level();
        level.setName(name);
        level.setDescription(description);
        level.setNumber(number);

        if (classroomId != null) {
            Classroom classroom = classroomRepo.findById(classroomId)
                    .orElseThrow(() -> new RuntimeException("Classroom not found"));
            level.setClassroom(classroom);
        }

        User teacher = userRepo.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        level.setTeacher(teacher);

        return levelRepo.save(level);
    }

    public FourPicOneWordPuzzle addPuzzleToLevel(Long levelId, String answer, String hint, List<MultipartFile> imageFiles) throws IOException {
        Level level = levelRepo.findById(levelId)
                .orElseThrow(() -> new RuntimeException("Level not found"));

        List<String> imageUrls = new ArrayList<>();
        String baseDir = "src/main/resources/static/images/activities/" + levelId + "/";
        new File(baseDir).mkdirs();

        for (MultipartFile file : imageFiles) {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File dest = new File(baseDir + fileName);
            file.transferTo(dest);
            imageUrls.add("/images/activities/" + levelId + "/" + fileName);
        }

        FourPicOneWordPuzzle puzzle = new FourPicOneWordPuzzle();
        puzzle.setLevel(level);
        puzzle.setAnswer(answer);
        puzzle.setHint(hint);
        puzzle.setImages(imageUrls);

        return puzzleRepo.save(puzzle);
    }

    public List<Level> getClassActivities(Long classId) {
        return levelRepo.findByClassroom_Id(classId);
    }

    public List<FourPicOneWordPuzzle> getPuzzlesByLevel(Long levelId) {
        return puzzleRepo.findByLevel_Id(levelId);
    }
}
