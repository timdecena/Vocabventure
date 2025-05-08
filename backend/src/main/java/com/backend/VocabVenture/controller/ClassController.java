package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.model.Class;
import com.backend.VocabVenture.model.User;
import com.backend.VocabVenture.service.ClassService;
import com.backend.VocabVenture.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "bearerAuth")
public class ClassController {

    private final ClassService classService;
    private final UserService userService;

    @Autowired
    public ClassController(ClassService classService, UserService userService) {
        this.classService = classService;
        this.userService = userService;
    }

    // Teacher endpoints
    @PostMapping("/teacher/class")
    @PreAuthorize("hasAuthority('ROLE_TEACHER')")
    @Operation(summary = "Create a new class", description = "Only teachers can create classes")
    public ResponseEntity<Class> createClass(@Valid @RequestBody Class classObj, @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userService.findByUsername(userDetails.getUsername());
        Class createdClass = classService.createClass(classObj, teacher.getId());
        return new ResponseEntity<>(createdClass, HttpStatus.CREATED);
    }

    @GetMapping("/teacher/classes")
    @PreAuthorize("hasAuthority('ROLE_TEACHER')")
    @Operation(summary = "Get all classes created by the teacher")
    public ResponseEntity<List<Class>> getTeacherClasses(@AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userService.findByUsername(userDetails.getUsername());
        List<Class> classes = classService.getTeacherClasses(teacher.getId());
        return ResponseEntity.ok(classes);
    }

    @PutMapping("/teacher/class/{classId}")
    @PreAuthorize("hasAuthority('ROLE_TEACHER')")
    @Operation(summary = "Update a class", description = "Only the teacher who created the class can update it")
    public ResponseEntity<Class> updateClass(
            @PathVariable Long classId,
            @Valid @RequestBody Class updatedClass,
            @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userService.findByUsername(userDetails.getUsername());
        Class result = classService.updateClass(classId, updatedClass, teacher.getId());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/teacher/class/{classId}")
    @PreAuthorize("hasAuthority('ROLE_TEACHER')")
    @Operation(summary = "Delete a class", description = "Only the teacher who created the class can delete it")
    public ResponseEntity<Map<String, String>> deleteClass(
            @PathVariable Long classId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userService.findByUsername(userDetails.getUsername());
        classService.deleteClass(classId, teacher.getId());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Class deleted successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/teacher/class/{classId}/student/{studentId}")
    @PreAuthorize("hasAuthority('ROLE_TEACHER')")
    @Operation(summary = "Remove a student from a class", description = "Only the teacher who created the class can remove students")
    public ResponseEntity<Class> removeStudentFromClass(
            @PathVariable Long classId,
            @PathVariable Long studentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userService.findByUsername(userDetails.getUsername());
        Class result = classService.removeStudentFromClass(classId, studentId, teacher.getId());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/teacher/class/{classId}/regenerate-code")
    @PreAuthorize("hasAuthority('ROLE_TEACHER')")
    @Operation(summary = "Regenerate join code for a class", description = "Only the teacher who created the class can regenerate the join code")
    public ResponseEntity<Map<String, String>> regenerateJoinCode(
            @PathVariable Long classId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User teacher = userService.findByUsername(userDetails.getUsername());
        Class result = classService.regenerateJoinCode(classId, teacher.getId());
        
        Map<String, String> response = new HashMap<>();
        response.put("joinCode", result.getJoinCode());
        return ResponseEntity.ok(response);
    }

    // Student endpoints
    @GetMapping("/student/classes")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    @Operation(summary = "Get all classes joined by the student")
    public ResponseEntity<List<Class>> getStudentClasses(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userService.findByUsername(userDetails.getUsername());
        List<Class> classes = classService.getStudentClasses(student.getId());
        return ResponseEntity.ok(classes);
    }

    @PostMapping("/student/class/join")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    @Operation(summary = "Join a class using a join code", description = "Only students can join classes")
    public ResponseEntity<?> joinClass(
            @RequestParam String joinCode,
            @AuthenticationPrincipal UserDetails userDetails) {
        User student = userService.findByUsername(userDetails.getUsername());
        
        try {
            Class joinedClass = classService.joinClass(joinCode, student.getId());
            return ResponseEntity.ok(joinedClass);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Common endpoints
    @GetMapping("/class/{classId}")
    @Operation(summary = "Get class details by ID", description = "Both teachers and students can view class details")
    public ResponseEntity<Class> getClassById(@PathVariable Long classId) {
        Class classObj = classService.getClassById(classId);
        return ResponseEntity.ok(classObj);
    }

    @GetMapping("/class/validate-code")
    @Operation(summary = "Validate a join code", description = "Check if a join code is valid")
    public ResponseEntity<Map<String, Boolean>> validateJoinCode(@RequestParam String joinCode) {
        boolean isValid = classService.isValidJoinCode(joinCode);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("valid", isValid);
        return ResponseEntity.ok(response);
    }
}
