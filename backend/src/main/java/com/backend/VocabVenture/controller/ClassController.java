package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.model.Class;
import com.backend.VocabVenture.security.JwtUtils;
import com.backend.VocabVenture.service.ClassService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/teacher/class")
@Tag(name = "Class", description = "Class management API endpoints")
@CrossOrigin(origins = "*")
public class ClassController {

    private final ClassService classService;
    private final JwtUtils jwtUtil;

    @Autowired
    public ClassController(ClassService classService, JwtUtils jwtUtil) {
        this.classService = classService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<Class> createClass(@RequestBody Class classEntity, HttpServletRequest request) {
        Long teacherId = jwtUtil.extractUserIdFromRequest(request);
        Class createdClass = classService.createClass(classEntity.getClassName(), classEntity.getDescription(), teacherId);
        return ResponseEntity.ok(createdClass);
    }

    @GetMapping
    public ResponseEntity<List<Class>> getAllTeacherClasses(HttpServletRequest request) {
        Long teacherId = jwtUtil.extractUserIdFromRequest(request);
        List<Class> classes = classService.getClassesByTeacherId(teacherId);
        return ResponseEntity.ok(classes);
    }

    @PostMapping("/join")
    public ResponseEntity<String> joinClass(@RequestParam String joinCode, HttpServletRequest request) {
        Long studentId = jwtUtil.extractUserIdFromRequest(request);
        classService.joinClass(joinCode, studentId);
        return ResponseEntity.ok("Successfully joined the class!");
    }
}
