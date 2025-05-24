package com.example.Vocabia.controller;

import com.example.Vocabia.dto.JoinClassDTO;
import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.service.ClassroomService;
import com.example.Vocabia.service.EnrollmentService;
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
    public Classroom joinClass(@RequestBody JoinClassDTO dto, Principal principal) {
        User student = getCurrentUser(principal);
        enrollmentService.joinClassroom(student, dto.getJoinCode());
        return classroomService.findByJoinCode(dto.getJoinCode()).orElseThrow();
    }

    @GetMapping
    public List<Classroom> myClasses(Principal principal) {
        User student = getCurrentUser(principal);
        return enrollmentService.getStudentClasses(student);
    }

    @GetMapping("/{id}/classmates")
    public List<User> classmates(@PathVariable Long id, Principal principal) {
        User student = getCurrentUser(principal);
        Classroom c = classroomService.findById(id).orElseThrow();
        // Optionally, only allow access if enrolled
        return enrollmentService.getClassmates(c);
    }
}
