package com.example.Vocabia.controller;

import com.example.Vocabia.dto.WOTDLeaderboardEntryDTO;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.EnrollmentRepository;
import com.example.Vocabia.repository.WordOfTheDayScoreRepository;
import com.example.Vocabia.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/teacher/wotd")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TeacherWOTDController {

    private final WordOfTheDayScoreRepository scoreRepo;
    private final UserService userService;
    private final EnrollmentRepository enrollmentRepo;

    @GetMapping("/leaderboard")
    @PreAuthorize("hasRole('TEACHER')")
    public List<WOTDLeaderboardEntryDTO> getMyStudentsLeaderboard(Principal principal) {
        User teacher = userService.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // ✅ Get all student IDs under this teacher (via Enrollment)
        List<Long> studentIds = enrollmentRepo.findByClassroomTeacherId(teacher.getId())
                .stream()
                .map(e -> e.getStudent().getId())
                .toList();

        if (studentIds.isEmpty()) {
            return List.of();
        }

        return scoreRepo.fetchLeaderboardForStudents(studentIds);
    }
}
