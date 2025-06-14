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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher/classes")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ClassroomController {

    private final ClassroomService classroomService;
    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;
    private final UserProgressService userProgressService;

    public ClassroomController(ClassroomService classroomService, 
                              EnrollmentService enrollmentService, 
                              UserRepository userRepository,
                              UserProgressService userProgressService) {
        this.classroomService = classroomService;
        this.enrollmentService = enrollmentService;
        this.userRepository = userRepository;
        this.userProgressService = userProgressService;
    }

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
        // Find the classroom in the teacher's classes
        Classroom classroom = classroomService.getTeacherClasses(teacher)
                .stream()
                .filter(c -> c.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Class not found or not authorized"));
        return ResponseEntity.ok(classroom);
    }

    @GetMapping("/{id}/students")
    public List<User> getStudents(@PathVariable Long id, Principal principal) {
        User teacher = getCurrentUser(principal);
        Classroom c = classroomService.getTeacherClasses(teacher)
                .stream().filter(cc -> cc.getId().equals(id)).findFirst()
                .orElseThrow(() -> new RuntimeException("Not your class"));
        return enrollmentService.getClassmates(c);
    }
    
    @GetMapping("/{id}/progress")
    public ResponseEntity<Map<String, Object>> getClassProgress(@PathVariable Long id, Principal principal) {
        User teacher = getCurrentUser(principal);
        
        // Verify teacher owns this class
        Classroom classroom = classroomService.getTeacherClasses(teacher)
                .stream().filter(c -> c.getId().equals(id)).findFirst()
                .orElseThrow(() -> new RuntimeException("Not your class"));
        
        // Get all students in this class
        List<User> students = enrollmentService.getClassmates(classroom);
        List<StudentProgressDTO> studentProgressList = new ArrayList<>();
        
        // Class-wide statistics
        int totalLevelsCompleted = 0;
        int totalCorrectAnswers = 0;
        int totalWrongAnswers = 0;
        int totalHintsUsed = 0;
        int totalAttempts = 0;
        LocalDateTime mostRecentActivity = null;
        
        // Get progress for each student
        for (User student : students) {
            List<UserProgressDTO> allProgress = userProgressService.getAllUserProgress(student);
            
            // Calculate student statistics
            int levelsCompleted = 0;
            int correctAnswers = 0;
            int wrongAnswers = 0;
            int hintsUsed = 0;
            int attempts = 0;
            LocalDateTime lastActive = null;
            
            for (UserProgressDTO progress : allProgress) {
                levelsCompleted += progress.getCurrentLevel() - 1; // Subtract 1 because level 1 is starting point
                correctAnswers += progress.getCorrectAnswers();
                wrongAnswers += progress.getWrongAnswers();
                hintsUsed += progress.getHintsUsed();
                attempts += progress.getTotalAttempts();
                
                // Track most recent activity
                if (progress.getLastActive() != null) {
                    if (lastActive == null || progress.getLastActive().isAfter(lastActive)) {
                        lastActive = progress.getLastActive();
                    }
                }
            }
            
            // Update class totals
            totalLevelsCompleted += levelsCompleted;
            totalCorrectAnswers += correctAnswers;
            totalWrongAnswers += wrongAnswers;
            totalHintsUsed += hintsUsed;
            totalAttempts += attempts;
            
            if (lastActive != null && (mostRecentActivity == null || lastActive.isAfter(mostRecentActivity))) {
                mostRecentActivity = lastActive;
            }
            
            // Calculate accuracy
            int accuracy = attempts > 0 ? (correctAnswers * 100) / attempts : 0;
            int hintUsageRate = attempts > 0 ? (hintsUsed * 100) / attempts : 0;
            
            // Create student progress DTO
            StudentProgressDTO studentProgress = new StudentProgressDTO();
            studentProgress.setId(student.getId());
            studentProgress.setFirstName(student.getFirstName());
            studentProgress.setLastName(student.getLastName());
            studentProgress.setEmail(student.getEmail());
            studentProgress.setLevelsCompleted(levelsCompleted);
            studentProgress.setAccuracy(accuracy);
            studentProgress.setHintUsage(hintUsageRate);
            studentProgress.setAverageTime(attempts > 0 ? 45 : 0); // Placeholder, actual time data not available
            studentProgress.setLastActive(lastActive);
            
            studentProgressList.add(studentProgress);
        }
        
        // Calculate class-wide averages
        int classSize = students.size();
        int averageCompletionRate = classSize > 0 ? (totalLevelsCompleted * 100) / (classSize * 25) : 0; // Assuming 25 total levels
        int averageAccuracy = totalAttempts > 0 ? (totalCorrectAnswers * 100) / totalAttempts : 0;
        int averageHintUsage = totalAttempts > 0 ? (totalHintsUsed * 100) / totalAttempts : 0;
        int averageTimePerLevel = classSize > 0 ? 45 : 0; // Placeholder, actual time data not available
        
        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("className", classroom.getName());
        response.put("classDescription", classroom.getDescription());
        response.put("averageCompletionRate", averageCompletionRate);
        response.put("averageAccuracy", averageAccuracy);
        response.put("averageHintUsage", averageHintUsage);
        response.put("averageTimePerLevel", averageTimePerLevel);
        response.put("totalLevelsCompleted", totalLevelsCompleted);
        response.put("students", studentProgressList);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{classId}/students/{studentId}/progress")
    public ResponseEntity<Map<String, Object>> getStudentProgress(
            @PathVariable Long classId,
            @PathVariable Long studentId,
            Principal principal) {
        
        User teacher = getCurrentUser(principal);
        
        // Verify teacher owns this class
        Classroom classroom = classroomService.getTeacherClasses(teacher)
                .stream().filter(c -> c.getId().equals(classId)).findFirst()
                .orElseThrow(() -> new RuntimeException("Not your class"));
        
        // Get the student and verify they are in this class
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        List<User> classStudents = enrollmentService.getClassmates(classroom);
        if (!classStudents.contains(student)) {
            throw new RuntimeException("Student is not enrolled in this class");
        }
        
        // Get all progress data for this student
        List<UserProgressDTO> allProgress = userProgressService.getAllUserProgress(student);
        
        // Calculate student statistics
        int levelsCompleted = 0;
        int correctAnswers = 0;
        int wrongAnswers = 0;
        int hintsUsed = 0;
        int attempts = 0;
        LocalDateTime lastActive = null;
        int streakCount = 0;
        int maxStreak = 0;
        
        // Track category performance
        Map<String, Map<String, Integer>> categoryStats = new HashMap<>();
        String bestCategory = "";
        String worstCategory = "";
        int bestCategoryAccuracy = 0;
        int worstCategoryAccuracy = 100;
        
        for (UserProgressDTO progress : allProgress) {
            String category = progress.getCategory();
            levelsCompleted += progress.getCurrentLevel() - 1; // Subtract 1 because level 1 is starting point
            correctAnswers += progress.getCorrectAnswers();
            wrongAnswers += progress.getWrongAnswers();
            hintsUsed += progress.getHintsUsed();
            attempts += progress.getTotalAttempts();
            streakCount = Math.max(streakCount, progress.getStreakCount());
            maxStreak = Math.max(maxStreak, progress.getMaxStreak());
            
            // Track most recent activity
            if (progress.getLastActive() != null) {
                if (lastActive == null || progress.getLastActive().isAfter(lastActive)) {
                    lastActive = progress.getLastActive();
                }
            }
            
            // Calculate category statistics
            int categoryAttempts = progress.getTotalAttempts();
            if (categoryAttempts > 0) {
                int categoryAccuracy = (progress.getCorrectAnswers() * 100) / categoryAttempts;
                int categoryCompletionRate = ((progress.getCurrentLevel() - 1) * 100) / 10; // Assuming 10 levels per category
                int categoryAvgTime = 45; // Placeholder, actual time data not available
                
                Map<String, Integer> stats = new HashMap<>();
                stats.put("accuracy", categoryAccuracy);
                stats.put("completionRate", categoryCompletionRate);
                stats.put("averageTime", categoryAvgTime);
                categoryStats.put(category, stats);
                
                // Track best and worst categories
                if (categoryAccuracy > bestCategoryAccuracy) {
                    bestCategoryAccuracy = categoryAccuracy;
                    bestCategory = category;
                }
                if (categoryAccuracy < worstCategoryAccuracy && categoryAttempts >= 5) { // Only consider categories with enough attempts
                    worstCategoryAccuracy = categoryAccuracy;
                    worstCategory = category;
                }
            }
        }
        
        // Calculate accuracy
        int accuracy = attempts > 0 ? (correctAnswers * 100) / attempts : 0;
        int hintUsageRate = attempts > 0 ? (hintsUsed * 100) / attempts : 0;
        
        // Create response with detailed student progress data
        Map<String, Object> response = new HashMap<>();
        
        // Basic student info
        response.put("id", student.getId());
        response.put("firstName", student.getFirstName());
        response.put("lastName", student.getLastName());
        response.put("email", student.getEmail());
        
        // Summary statistics
        Map<String, Object> summary = new HashMap<>();
        summary.put("levelsCompleted", levelsCompleted);
        summary.put("totalLevels", 30); // Assuming 30 total levels across all categories
        summary.put("accuracy", accuracy);
        summary.put("averageTime", attempts > 0 ? 45 : 0); // Placeholder, actual time data not available
        summary.put("hintUsage", hintUsageRate);
        summary.put("lastActive", lastActive);
        summary.put("streak", streakCount);
        summary.put("maxStreak", maxStreak);
        summary.put("bestCategory", bestCategory.isEmpty() ? "None" : bestCategory);
        summary.put("worstCategory", worstCategory.isEmpty() ? "None" : worstCategory);
        response.put("summary", summary);
        
        // Category performance data
        List<Map<String, Object>> categoryPerformance = new ArrayList<>();
        for (Map.Entry<String, Map<String, Integer>> entry : categoryStats.entrySet()) {
            Map<String, Object> categoryData = new HashMap<>();
            categoryData.put("category", entry.getKey());
            categoryData.put("accuracy", entry.getValue().get("accuracy"));
            categoryData.put("completionRate", entry.getValue().get("completionRate"));
            categoryData.put("averageTime", entry.getValue().get("averageTime"));
            categoryPerformance.add(categoryData);
        }
        response.put("categoryPerformance", categoryPerformance);
        
        // Add placeholder data for charts and visualizations
        // In a real implementation, this would be calculated from historical data
        List<Map<String, Object>> progressOverTime = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 4; i >= 0; i--) {
            Map<String, Object> point = new HashMap<>();
            point.put("date", now.minusWeeks(i).toLocalDate().toString());
            point.put("levelsCompleted", Math.max(0, levelsCompleted - (i * 3))); // Simulate progress over time
            point.put("accuracy", Math.max(0, accuracy - (i * 2))); // Simulate accuracy improvement
            progressOverTime.add(point);
        }
        response.put("progressOverTime", progressOverTime);
        
        // Skill radar data
        List<Map<String, Object>> skillRadar = new ArrayList<>();
        Map<String, Object> accuracySkill = new HashMap<>();
        accuracySkill.put("subject", "Accuracy");
        accuracySkill.put("A", accuracy);
        accuracySkill.put("fullMark", 100);
        skillRadar.add(accuracySkill);
        
        Map<String, Object> speedSkill = new HashMap<>();
        speedSkill.put("subject", "Speed");
        speedSkill.put("A", attempts > 0 ? 65 : 0); // Placeholder
        speedSkill.put("fullMark", 100);
        skillRadar.add(speedSkill);
        
        Map<String, Object> consistencySkill = new HashMap<>();
        consistencySkill.put("subject", "Consistency");
        consistencySkill.put("A", streakCount > 0 ? 70 : 0); // Placeholder
        consistencySkill.put("fullMark", 100);
        skillRadar.add(consistencySkill);
        
        Map<String, Object> completionSkill = new HashMap<>();
        completionSkill.put("subject", "Completion");
        completionSkill.put("A", levelsCompleted > 0 ? (levelsCompleted * 100) / 30 : 0); // Assuming 30 total levels
        completionSkill.put("fullMark", 100);
        skillRadar.add(completionSkill);
        
        Map<String, Object> independenceSkill = new HashMap<>();
        independenceSkill.put("subject", "Independence");
        independenceSkill.put("A", attempts > 0 ? 100 - hintUsageRate : 0); // Higher independence = lower hint usage
        independenceSkill.put("fullMark", 100);
        skillRadar.add(independenceSkill);
        
        response.put("skillRadar", skillRadar);
        
        return ResponseEntity.ok(response);
    }
}
