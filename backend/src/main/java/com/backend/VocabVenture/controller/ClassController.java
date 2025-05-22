package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.dto.StudentBasicDTO;
import com.backend.VocabVenture.dto.UserDTO;
import com.backend.VocabVenture.model.ClassEntity;
import com.backend.VocabVenture.service.ClassService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
public ResponseEntity<List<StudentBasicDTO>> getStudentsInClass(@PathVariable Long classId) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    System.out.println("Authenticated user: " + auth.getName());
    System.out.println("Authorities: " + auth.getAuthorities());

    return ResponseEntity.ok(classService.getStudentsInClass(classId, auth.getName()));
}
}
