package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.dto.UserDTO;
import com.backend.VocabVenture.model.ClassEntity;
import com.backend.VocabVenture.service.ClassService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/classes")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class ClassController {

    private final ClassService classService;

    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    @GetMapping
    public List<ClassEntity> getClasses() {
        return classService.getAllClassesForTeacher();
    }

    @PostMapping
    public ResponseEntity<ClassEntity> createClass(@RequestBody ClassEntity request) {
        ClassEntity created = classService.createClass(request.getClassName(), request.getDescription());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassEntity> updateClass(@PathVariable Long id, @RequestBody ClassEntity request) {
        ClassEntity updated = classService.updateClass(id, request.getClassName(), request.getDescription());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable Long id) {
        classService.deleteClass(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/classes/{classId}/students")
public ResponseEntity<List<UserDTO>> getStudentsInClass(@PathVariable Long classId) {
    String teacherUsername = SecurityContextHolder.getContext().getAuthentication().getName();
    List<UserDTO> students = classService.getStudentsInClass(classId, teacherUsername);
    return ResponseEntity.ok(students);
}
}
