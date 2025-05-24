package com.example.Vocabia.controller;

<<<<<<< HEAD
import com.example.Vocabia.dto.ClassroomDTO;
import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.service.ClassroomService;
import com.example.Vocabia.service.EnrollmentService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/teacher/classes")
=======
import com.example.Vocabia.entity.Classroom;
import com.example.Vocabia.service.ClassroomService;
import com.example.Vocabia.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classroom")
>>>>>>> 9c235d03163cc3f9d8a9c7738f6667321e880070
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ClassroomController {

    private final ClassroomService classroomService;
<<<<<<< HEAD
    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;

    public ClassroomController(ClassroomService classroomService, EnrollmentService enrollmentService, UserRepository userRepository) {
        this.classroomService = classroomService;
        this.enrollmentService = enrollmentService;
        this.userRepository = userRepository;
    }

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
=======
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

>>>>>>> 9c235d03163cc3f9d8a9c7738f6667321e880070
}
