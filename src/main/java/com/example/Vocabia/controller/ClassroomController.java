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
}
