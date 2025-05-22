
package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.model.ClassEntity;
import com.backend.VocabVenture.service.StudentClassService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/class")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class StudentClassController {

    private final StudentClassService studentClassService;

    public StudentClassController(StudentClassService studentClassService) {
        this.studentClassService = studentClassService;
    }

    @PostMapping("/join")
    public ResponseEntity<ClassEntity> joinClass(@RequestBody JoinCodeRequest request) {
        return ResponseEntity.ok(studentClassService.joinClass(request.getJoinCode()));
    }

    @DeleteMapping("/{classId}/leave")
    public ResponseEntity<Void> leaveClass(@PathVariable Long classId) {
        studentClassService.leaveClass(classId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<ClassEntity>> getMyClasses() {
        return ResponseEntity.ok(studentClassService.getJoinedClasses());
    }

    // DTO class for request
    public static class JoinCodeRequest {
        private String joinCode;

        public String getJoinCode() {
            return joinCode;
        }

        public void setJoinCode(String joinCode) {
            this.joinCode = joinCode;
        }
    }
}
