package com.example.Vocabia.service;

import com.example.Vocabia.dto.FourPicsOneWordSubmissionDTO;
import com.example.Vocabia.dto.LeaderboardEntryDTO;
import com.example.Vocabia.entity.*;
import com.example.Vocabia.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FourPicsOneWordService {

    private final FourPicsOneWordLevelRepository levelRepo;
    private final FourPicsOneWordScoreRepository scoreRepo;
    private final ClassroomRepository classroomRepo;
    private final UserRepository userRepo;

    public List<FourPicsOneWordLevel> getGlobalLevels() {
        return levelRepo.findByIsGlobalTrue();
    }

    public List<FourPicsOneWordLevel> getClassLevels(Long classId, User student) {
        Classroom classroom = classroomRepo.findById(classId).orElseThrow();
        return levelRepo.findByClassroom(classroom);
    }

    public void createLevel(FourPicsOneWordLevel level, User teacher) {
        if (!level.isGlobal() && level.getClassroom() != null) {
            Classroom c = classroomRepo.findById(level.getClassroom().getId()).orElseThrow();
            if (!c.getTeacher().getId().equals(teacher.getId())) {
                throw new RuntimeException("Forbidden");
            }
        }
        levelRepo.save(level);
    }

    public void submitAnswer(User student, FourPicsOneWordSubmissionDTO dto) {
        FourPicsOneWordLevel level = levelRepo.findById(dto.getLevelId()).orElseThrow();
        boolean isCorrect = level.getWord().equalsIgnoreCase(dto.getAnswer().trim());
        int score = isCorrect ? 10 : 0;

        Optional<FourPicsOneWordScore> existing = scoreRepo.findByStudent(student).stream()
            .filter(s -> s.getLevel().getId().equals(level.getId())).findFirst();

        if (existing.isPresent()) {
            FourPicsOneWordScore s = existing.get();
            if (!s.isCompleted()) {
                s.setScore(score);
                s.setCompleted(true);
                scoreRepo.save(s);
            }
        } else {
            FourPicsOneWordScore s = new FourPicsOneWordScore(null, student, level, score, true);
            scoreRepo.save(s);
        }
    }

    public List<LeaderboardEntryDTO> getGlobalLeaderboard() {
        return scoreRepo.findAll().stream()
                .filter(FourPicsOneWordScore::isCompleted)
                .filter(s -> s.getLevel().isGlobal())
                .collect(Collectors.groupingBy(
                        s -> s.getStudent().getEmail(),
                        Collectors.summingInt(FourPicsOneWordScore::getScore)
                ))
                .entrySet().stream()
                .map(e -> {
                    User u = userRepo.findByEmail(e.getKey()).orElseThrow();
                    return new LeaderboardEntryDTO(u.getFirstName() + " " + u.getLastName(), e.getValue());
                }).sorted((a, b) -> b.getTotalScore() - a.getTotalScore())
                .collect(Collectors.toList());
    }

    public List<LeaderboardEntryDTO> getClassLeaderboard(Long classId) {
        return scoreRepo.findByLevel_Classroom_Id(classId).stream()
                .filter(FourPicsOneWordScore::isCompleted)
                .collect(Collectors.groupingBy(
                        s -> s.getStudent().getEmail(),
                        Collectors.summingInt(FourPicsOneWordScore::getScore)
                ))
                .entrySet().stream()
                .map(e -> {
                    User u = userRepo.findByEmail(e.getKey()).orElseThrow();
                    return new LeaderboardEntryDTO(u.getFirstName() + " " + u.getLastName(), e.getValue());
                }).sorted((a, b) -> b.getTotalScore() - a.getTotalScore())
                .collect(Collectors.toList());
    }
}
