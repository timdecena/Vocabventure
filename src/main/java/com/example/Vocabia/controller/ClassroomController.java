package com.example.Vocabia.controller;

import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.service.ClassroomService;
import com.example.Vocabia.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classroom")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ClassroomController {

    private final ClassroomService classroomService;
    private final JwtUtil jwtUtil;

    public ClassroomController(ClassroomService service, JwtUtil jwtUtil) {
        this.classroomService = service;
        this.jwtUtil = jwtUtil;
    }

    private String extractEmailFromToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractEmail(token);
        }
        throw new RuntimeException("Missing or invalid token");
    }

    @PostMapping("/create")
    public Classroom createClass(@RequestHeader("Authorization") String authHeader, @RequestBody CreateClassRequest req) {
        String teacherEmail = extractEmailFromToken(authHeader);
        return classroomService.createClass(req.getClassName(), teacherEmail);
    }

    @PostMapping("/{id}/apply")
    public Classroom applyToClass(@RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
        String studentEmail = extractEmailFromToken(authHeader);
        return classroomService.requestToJoin(id, studentEmail);
    }

    @PostMapping("/{id}/accept/{studentId}")
    public Classroom acceptStudent(@RequestHeader("Authorization") String authHeader, @PathVariable Long id, @PathVariable Long studentId) {
        String teacherEmail = extractEmailFromToken(authHeader);
        return classroomService.acceptStudent(id, studentId, teacherEmail);
    }

    @PostMapping("/{id}/reject/{studentId}")
    public Classroom rejectStudent(@RequestHeader("Authorization") String authHeader, @PathVariable Long id, @PathVariable Long studentId) {
        String teacherEmail = extractEmailFromToken(authHeader);
        return classroomService.rejectStudent(id, studentId, teacherEmail);
    }

    @GetMapping("/all")
public List<Classroom> getAllClasses() {
    return classroomService.getAllClasses();
}

@GetMapping("/teacher/classes")
public List<Classroom> getMyClasses(@RequestHeader("Authorization") String authHeader) {
    String email = extractEmailFromToken(authHeader);
    return classroomService.getClassesByTeacher(email);
}

}
