package com.example.Vocabia.controller;

import com.example.Vocabia.dto.JoinClassDTO;
import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.service.ClassroomService;
import com.example.Vocabia.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/student/classes")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class StudentClassController {

    private final EnrollmentService enrollmentService;
    private final ClassroomService classroomService;
    private final UserRepository userRepository;

    public StudentClassController(EnrollmentService enrollmentService, ClassroomService classroomService, UserRepository userRepository) {
        this.enrollmentService = enrollmentService;
        this.classroomService = classroomService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinClass(@RequestBody JoinClassDTO dto, Principal principal) {
        User student = getCurrentUser(principal);
        try {
            Classroom classroom = classroomService.findByJoinCode(dto.getJoinCode())
                    .orElseThrow(() -> new RuntimeException("Invalid join code"));
            // Check if already enrolled
            boolean alreadyEnrolled = enrollmentService.getStudentClasses(student)
                    .stream().anyMatch(c -> c.getId().equals(classroom.getId()));
            if (alreadyEnrolled) {
                return ResponseEntity.badRequest().body("You are already enrolled in this class.");
            }
            enrollmentService.joinClassroom(student, dto.getJoinCode());
            return ResponseEntity.ok(classroom);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public List<Classroom> myClasses(Principal principal) {
        User student = getCurrentUser(principal);
        return enrollmentService.getStudentClasses(student);
    }

    @GetMapping("/{id}/classmates")
    public ResponseEntity<?> classmates(@PathVariable Long id, Principal principal) {
        User student = getCurrentUser(principal);
        Classroom c = classroomService.findById(id).orElse(null);
        if (c == null) {
            return ResponseEntity.notFound().build();
        }
        // Only allow access if the student is enrolled
        boolean enrolled = enrollmentService.getStudentClasses(student)
                .stream().anyMatch(cl -> cl.getId().equals(id));
        if (!enrolled) {
            return ResponseEntity.status(403).body("You are not enrolled in this class.");
        }
        return ResponseEntity.ok(enrollmentService.getClassmates(c));
    }
}
