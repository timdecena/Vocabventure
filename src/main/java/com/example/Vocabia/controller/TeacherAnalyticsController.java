package com.example.Vocabia.controller;

import com.example.Vocabia.dto.UserProgressDTO;
import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.service.ClassroomService;
import com.example.Vocabia.service.EnrollmentService;
import com.example.Vocabia.service.FourPicOneWordService;
import com.example.Vocabia.service.UserProgressService;
import com.example.Vocabia.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class TeacherAnalyticsController {

    private final ClassroomService classroomService;
    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;
    private final UserProgressService userProgressService;
    private final FourPicOneWordService fourPicOneWordService;

    private User getCurrentUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/fpow-progress")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, Object>> getFpowProgress(
            @RequestParam(name = "range", required = false, defaultValue = "30d") String range,
            @RequestParam(name = "class", required = false) Long classId,
            @RequestParam(name = "game", required = false, defaultValue = "all") String categoryFilter,
            Principal principal
    ) {
        User teacher = getCurrentUser(principal);

        // Resolve classes within teacher scope
        List<Classroom> classes = classroomService.getTeacherClasses(teacher);
        if (classId != null) {
            classes = classes.stream().filter(c -> Objects.equals(c.getId(), classId)).collect(Collectors.toList());
        }
        // Map students to class meta
        Map<Long, Classroom> studentClassMap = new HashMap<>();
        List<User> students = new ArrayList<>();
        for (Classroom c : classes) {
            List<User> clsStudents = enrollmentService.getClassmates(c);
            for (User s : clsStudents) {
                students.add(s);
                studentClassMap.put(s.getId(), c);
            }
        }

        // Categories to include
        List<String> categories = fourPicOneWordService.getCategories();
        if (categoryFilter != null && !"all".equalsIgnoreCase(categoryFilter)) {
            categories = categories.stream()
                    .filter(cat -> cat.equalsIgnoreCase(categoryFilter))
                    .collect(Collectors.toList());
        }

        // Range handling for activity timeline
        int days = 30;
        if ("7d".equalsIgnoreCase(range)) days = 7;
        if ("all".equalsIgnoreCase(range)) days = 30; // default to 30 for now; per-level timestamps are not tracked
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> weeklyProgress = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            weeklyProgress.add(new HashMap<>(Map.of(
                    "day", d.toString(),
                    // Only real data: we can reliably compute active students by lastActive day
                    "studentsActive", 0,
                    // Level completion timestamps are not stored per attempt, keep 0 to avoid fake data
                    "levelsCompleted", 0
            )));
        }

        // Per-student progress aggregation
        List<Map<String, Object>> studentProgress = new ArrayList<>();
        for (User s : students) {
            List<UserProgressDTO> progressList = userProgressService.getAllUserProgress(s);
            if (categoryFilter != null && !"all".equalsIgnoreCase(categoryFilter)) {
                progressList = progressList.stream()
                        .filter(p -> categoryFilter.equalsIgnoreCase(p.getCategory()))
                        .collect(Collectors.toList());
            } else {
                // If categories filtered by DB categories set, keep only those
                Set<String> catSet = new HashSet<>(categories);
                progressList = progressList.stream()
                        .filter(p -> catSet.contains(p.getCategory()))
                        .collect(Collectors.toList());
            }
            if (progressList.isEmpty()) continue;

            int totalAttempts = 0, correct = 0, hints = 0;
            int levelsCompletedSum = 0;
            LocalDateTime lastActive = null;
            // Track unfinished categories and levels remaining
            int unfinishedCategories = 0;
            int levelsRemaining = 0;

            for (UserProgressDTO p : progressList) {
                totalAttempts += Math.max(0, p.getTotalAttempts());
                correct += Math.max(0, p.getCorrectAnswers());
                hints += Math.max(0, p.getHintsUsed());
                // Use unique completed levels per category from progress service
                try {
                    List<Integer> completedLvls = userProgressService.getCompletedLevels(s, p.getCategory());
                    levelsCompletedSum += completedLvls != null ? completedLvls.size() : 0;
                    // Compute unfinished stats for this category
                    int totalLevelsForCat = fourPicOneWordService.getLevelsByCategory(p.getCategory()).size();
                    int completedForCat = completedLvls != null ? completedLvls.size() : 0;
                    if (totalLevelsForCat > 0 && completedForCat < totalLevelsForCat) {
                        unfinishedCategories += 1;
                        levelsRemaining += Math.max(0, totalLevelsForCat - completedForCat);
                    }
                } catch (Exception ignore) { }
                if (p.getLastActive() != null && (lastActive == null || p.getLastActive().isAfter(lastActive))) {
                    lastActive = p.getLastActive();
                }
            }

            int accuracy = totalAttempts > 0 ? (correct * 100) / totalAttempts : 0;
            int hintRate = totalAttempts > 0 ? (hints * 100) / totalAttempts : 0;
            // Approximate total time spent in minutes based on attempts (placeholder 45s per attempt)
            int timeSpentMinutes = (int) Math.round((totalAttempts * 45.0) / 60.0);
            Classroom cls = studentClassMap.get(s.getId());

            // Determine struggling status using simple heuristics
            List<String> strugglingReasons = new ArrayList<>();
            if (accuracy < 60) strugglingReasons.add("low_accuracy");
            if (hintRate > 40) strugglingReasons.add("high_hint_usage");
            if (lastActive != null && lastActive.isBefore(LocalDateTime.now().minusDays(14))) {
                strugglingReasons.add("inactive_recently");
            }
            boolean struggling = !strugglingReasons.isEmpty();

            Map<String, Object> row = new HashMap<>();
            row.put("studentName", s.getFirstName() + " " + s.getLastName());
            row.put("studentId", s.getId());
            row.put("classId", cls != null ? cls.getId() : null);
            row.put("className", cls != null ? cls.getName() : "");
            row.put("levelsCompleted", levelsCompletedSum);
            row.put("accuracy", accuracy);
            row.put("hintsUsed", hints);
            row.put("timeSpent", timeSpentMinutes);
            row.put("lastActive", lastActive != null ? lastActive.toString() : null);
            row.put("unfinishedCategories", unfinishedCategories);
            row.put("levelsRemaining", levelsRemaining);
            row.put("hintRate", hintRate);
            row.put("struggling", struggling);
            row.put("strugglingReasons", strugglingReasons);
            studentProgress.add(row);

            // Update weekly active counts based on lastActive real date
            if (lastActive != null) {
                LocalDate activeDate = lastActive.toLocalDate();
                for (Map<String, Object> w : weeklyProgress) {
                    if (Objects.equals(w.get("day"), activeDate.toString())) {
                        int current = ((Number) w.get("studentsActive")).intValue();
                        w.put("studentsActive", current + 1);
                        break;
                    }
                }
            }
        }

        // Category progress: average completed levels per student vs total levels for that category
        List<Map<String, Object>> categoryProgress = new ArrayList<>();
        int studentCount = students.size();
        for (String cat : categories) {
            int totalLevels = fourPicOneWordService.getLevelsByCategory(cat).size();
            if (totalLevels == 0) continue;

            // Sum completed levels across students (unique per student by category)
            int completedSum = 0;
            int accCorrect = 0, accAttempts = 0;
            for (User s : students) {
                try {
                    List<UserProgressDTO> pls = userProgressService.getAllUserProgress(s).stream()
                            .filter(p -> cat.equals(p.getCategory()))
                            .collect(Collectors.toList());
                    if (pls.isEmpty()) continue;
                    // completed per student for this category using unique completed levels
                    int completed = 0;
                    try {
                        List<Integer> completedLvls = userProgressService.getCompletedLevels(s, cat);
                        completed = completedLvls != null ? completedLvls.size() : 0;
                    } catch (Exception ignore) { }
                    completedSum += completed;
                    for (UserProgressDTO p : pls) {
                        accCorrect += Math.max(0, p.getCorrectAnswers());
                        accAttempts += Math.max(0, p.getTotalAttempts());
                    }
                } catch (Exception ignore) { }
            }
            int avgCompletedPerStudent = studentCount > 0 ? completedSum / studentCount : 0;
            int accuracy = accAttempts > 0 ? (accCorrect * 100) / accAttempts : 0;

            Map<String, Object> row = new HashMap<>();
            row.put("category", cat);
            row.put("completed", avgCompletedPerStudent); // average completed levels per student
            row.put("total", totalLevels);
            row.put("accuracy", accuracy);
            categoryProgress.add(row);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("studentProgress", studentProgress);
        response.put("categoryProgress", categoryProgress);
        response.put("weeklyProgress", weeklyProgress);
        response.put("categories", fourPicOneWordService.getCategories());
        return ResponseEntity.ok(response);
    }
}
