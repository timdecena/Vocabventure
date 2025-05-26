package com.example.Vocabia.controller;

import com.example.Vocabia.dto.ClassroomDTO;
import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.service.ClassroomService;
import com.example.Vocabia.service.EnrollmentService;
import lombok.RequiredArgsConstructor; // <-- Add this import

import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/teacher/classes")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor // <-- Add this annotation
public class ClassroomController {

    private final ClassroomService classroomService;
    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;

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

    @GetMapping("/{id}/students")
    public List<User> getStudents(@PathVariable Long id, Principal principal) {
        User teacher = getCurrentUser(principal);
        Classroom c = classroomService.getTeacherClasses(teacher)
                .stream().filter(cc -> cc.getId().equals(id)).findFirst()
                .orElseThrow(() -> new RuntimeException("Not your class"));
        return enrollmentService.getClassmates(c);
    }
}
