package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.model.ClassEntity;
import com.backend.VocabVenture.security.JwtUtils;
import com.backend.VocabVenture.service.ClassService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/class")
public class ClassController {

    @Autowired
    private ClassService classService;

    @Autowired
    private JwtUtils jwtUtil;

    @PostMapping
    public ClassEntity createClass(@RequestBody ClassEntity classEntity, HttpServletRequest request) {
        Long teacherId = jwtUtil.extractUserIdFromRequest(request);
        return classService.createClass(classEntity.getClassName(), classEntity.getDescription(), teacherId);
    }

    @GetMapping
    public List<ClassEntity> getAllTeacherClasses(HttpServletRequest request) {
        Long teacherId = jwtUtil.extractUserIdFromRequest(request);
        return classService.getClassesByTeacherId(teacherId);
    }
}
