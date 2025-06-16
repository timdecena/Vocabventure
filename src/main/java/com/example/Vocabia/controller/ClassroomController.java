package com.example.Vocabia.controller;

import com.example.Vocabia.dto.ClassroomDTO;
import com.example.Vocabia.dto.StudentProgressDTO;
import com.example.Vocabia.dto.UserProgressDTO;
import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.service.ClassroomService;
import com.example.Vocabia.service.EnrollmentService;
import com.example.Vocabia.service.UserProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/teacher/classes")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;
    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;
    private final UserProgressService userProgressService;

    private User getCurrentUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public Classroom createClass(@RequestBody ClassroomDTO dto, Principal principal) {
        User teacher = getCurrentUser(principal);
        if (!"TEACHER".equalsIgnoreCase(teacher.getRole()))
            throw new RuntimeException("Only teachers can create classes");
        return classroomService.createClassroom(dto.getName(), dto.getDescription(), teacher);
    }

    @PutMapping("/{id}")
    public Classroom updateClass(@PathVariable Long id, @RequestBody ClassroomDTO dto, Principal principal) {
        User teacher = getCurrentUser(principal);
        return classroomService.updateClassroom(id, dto.getName(), dto.getDescription(), teacher);
    }

    @DeleteMapping("/{id}")
    public void deleteClass(@PathVariable Long id, Principal principal) {
        User teacher = getCurrentUser(principal);
        classroomService.deleteClassroom(id, teacher);
    }

    @GetMapping
    public List<Classroom> myClasses(Principal principal) {
        User teacher = getCurrentUser(principal);
        return classroomService.getTeacherClasses(teacher);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Classroom> getClassById(@PathVariable Long id, Principal principal) {
        User teacher = getCurrentUser(principal);
        Classroom classroom = classroomService.getTeacherClasses(teacher)
                .stream().filter(c -> c.getId().equals(id)).findFirst()
                .orElseThrow(() -> new RuntimeException("Class not found or not authorized"));
        return ResponseEntity.ok(classroom);
    }

    @GetMapping("/{id}/students")
    public List<User> getStudents(@PathVariable Long id, Principal principal) {
        User teacher = getCurrentUser(principal);
        Classroom classroom = classroomService.getTeacherClasses(teacher)
                .stream().filter(c -> c.getId().equals(id)).findFirst()
                .orElseThrow(() -> new RuntimeException("Not your class"));
        return enrollmentService.getClassmates(classroom);
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<Map<String, Object>> getClassProgress(@PathVariable Long id, Principal principal) {
        User teacher = getCurrentUser(principal);
        Classroom classroom = classroomService.getTeacherClasses(teacher)
                .stream().filter(c -> c.getId().equals(id)).findFirst()
                .orElseThrow(() -> new RuntimeException("Not your class"));

        List<User> students = enrollmentService.getClassmates(classroom);
        List<StudentProgressDTO> studentProgressList = new ArrayList<>();

        int totalLevelsCompleted = 0, totalCorrect = 0, totalWrong = 0, totalHints = 0, totalAttempts = 0;
        LocalDateTime mostRecent = null;

        for (User student : students) {
            List<UserProgressDTO> progresses = userProgressService.getAllUserProgress(student);
            int levels = 0, correct = 0, wrong = 0, hints = 0, attempts = 0;
            LocalDateTime lastActive = null;

            for (UserProgressDTO p : progresses) {
                levels += p.getCurrentLevel() - 1;
                correct += p.getCorrectAnswers();
                wrong += p.getWrongAnswers();
                hints += p.getHintsUsed();
                attempts += p.getTotalAttempts();
                if (p.getLastActive() != null && (lastActive == null || p.getLastActive().isAfter(lastActive))) {
                    lastActive = p.getLastActive();
                }
            }

            totalLevelsCompleted += levels;
            totalCorrect += correct;
            totalWrong += wrong;
            totalHints += hints;
            totalAttempts += attempts;
            if (lastActive != null && (mostRecent == null || lastActive.isAfter(mostRecent))) {
                mostRecent = lastActive;
            }

            int accuracy = attempts > 0 ? (correct * 100) / attempts : 0;
            int hintRate = attempts > 0 ? (hints * 100) / attempts : 0;

            studentProgressList.add(StudentProgressDTO.builder()
                    .id(student.getId())
                    .firstName(student.getFirstName())
                    .lastName(student.getLastName())
                    .email(student.getEmail())
                    .levelsCompleted(levels)
                    .accuracy(accuracy)
                    .hintUsage(hintRate)
                    .averageTime(attempts > 0 ? 45 : 0)
                    .lastActive(lastActive)
                    .build());
        }

        int classSize = students.size();
        Map<String, Object> response = new HashMap<>();
        response.put("className", classroom.getName());
        response.put("classDescription", classroom.getDescription());
        response.put("averageCompletionRate", classSize > 0 ? (totalLevelsCompleted * 100) / (classSize * 25) : 0);
        response.put("averageAccuracy", totalAttempts > 0 ? (totalCorrect * 100) / totalAttempts : 0);
        response.put("averageHintUsage", totalAttempts > 0 ? (totalHints * 100) / totalAttempts : 0);
        response.put("averageTimePerLevel", classSize > 0 ? 45 : 0);
        response.put("totalLevelsCompleted", totalLevelsCompleted);
        response.put("totalWrongAnswers", totalWrong);
        response.put("students", studentProgressList);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{classId}/students/{studentId}/progress")
    public ResponseEntity<Map<String, Object>> getStudentProgress(
            @PathVariable Long classId,
            @PathVariable Long studentId,
            Principal principal) {

        User teacher = getCurrentUser(principal);
        Classroom classroom = classroomService.getTeacherClasses(teacher)
                .stream().filter(c -> c.getId().equals(classId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Not your class"));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (!enrollmentService.getClassmates(classroom).contains(student)) {
            throw new RuntimeException("Student is not enrolled in this class");
        }

        List<UserProgressDTO> progresses = userProgressService.getAllUserProgress(student);
        int levels = 0, correct = 0, wrong = 0, hints = 0, attempts = 0, streak = 0, maxStreak = 0;
        LocalDateTime lastActive = null;
        Map<String, Map<String, Integer>> categoryStats = new HashMap<>();
        String bestCategory = "", worstCategory = "";
        int bestAcc = 0, worstAcc = 100;

        for (UserProgressDTO p : progresses) {
            levels += p.getCurrentLevel() - 1;
            correct += p.getCorrectAnswers();
            wrong += p.getWrongAnswers();
            hints += p.getHintsUsed();
            attempts += p.getTotalAttempts();
            streak = Math.max(streak, p.getStreakCount());
            maxStreak = Math.max(maxStreak, p.getMaxStreak());
            if (p.getLastActive() != null && (lastActive == null || p.getLastActive().isAfter(lastActive)))
                lastActive = p.getLastActive();

            if (p.getTotalAttempts() > 0) {
                int acc = (p.getCorrectAnswers() * 100) / p.getTotalAttempts();
                int compRate = ((p.getCurrentLevel() - 1) * 100) / 10;
                categoryStats.put(p.getCategory(), Map.of(
                        "accuracy", acc,
                        "completionRate", compRate,
                        "averageTime", 45
                ));
                if (acc > bestAcc) {
                    bestAcc = acc;
                    bestCategory = p.getCategory();
                }
                if (acc < worstAcc && p.getTotalAttempts() >= 5) {
                    worstAcc = acc;
                    worstCategory = p.getCategory();
                }
            }
        }

        int accuracy = attempts > 0 ? (correct * 100) / attempts : 0;
        int hintRate = attempts > 0 ? (hints * 100) / attempts : 0;

        Map<String, Object> response = new HashMap<>();
        response.put("id", student.getId());
        response.put("firstName", student.getFirstName());
        response.put("lastName", student.getLastName());
        response.put("email", student.getEmail());

        Map<String, Object> summary = new HashMap<>();
        summary.put("levelsCompleted", levels);
        summary.put("totalLevels", 30);
        summary.put("accuracy", accuracy);
        summary.put("wrongAnswers", wrong);
        summary.put("averageTime", attempts > 0 ? 45 : 0);
        summary.put("hintUsage", hintRate);
        summary.put("lastActive", lastActive);
        summary.put("streak", streak);
        summary.put("maxStreak", maxStreak);
        summary.put("bestCategory", bestCategory.isEmpty() ? "None" : bestCategory);
        summary.put("worstCategory", worstCategory.isEmpty() ? "None" : worstCategory);
        response.put("summary", summary);

        List<Map<String, Object>> categoryPerformance = new ArrayList<>();
        for (var entry : categoryStats.entrySet()) {
            Map<String, Object> map = new HashMap<>(entry.getValue());
            map.put("category", entry.getKey());
            categoryPerformance.add(map);
        }
        response.put("categoryPerformance", categoryPerformance);

        List<Map<String, Object>> progressOverTime = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 4; i >= 0; i--) {
            progressOverTime.add(Map.of(
                    "date", now.minusWeeks(i).toLocalDate().toString(),
                    "levelsCompleted", Math.max(0, levels - i * 3),
                    "accuracy", Math.max(0, accuracy - i * 2)
            ));
        }
        response.put("progressOverTime", progressOverTime);

        List<Map<String, Object>> skillRadar = List.of(
                Map.of("subject", "Accuracy", "A", accuracy, "fullMark", 100),
                Map.of("subject", "Speed", "A", attempts > 0 ? 65 : 0, "fullMark", 100),
                Map.of("subject", "Consistency", "A", streak > 0 ? 70 : 0, "fullMark", 100),
                Map.of("subject", "Completion", "A", levels > 0 ? (levels * 100) / 30 : 0, "fullMark", 100),
                Map.of("subject", "Independence", "A", attempts > 0 ? 100 - hintRate : 0, "fullMark", 100)
        );
        response.put("skillRadar", skillRadar);

        return ResponseEntity.ok(response);
    }
}
