package com.example.Vocabia.adventure.controller;

import com.example.Vocabia.adventure.dto.JungleLushProgressDTO;
import com.example.Vocabia.adventure.service.JungleLushProgressService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/adventure/progress/jungle")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class JungleLushProgressController {

    private final JungleLushProgressService jungleService;

    public JungleLushProgressController(JungleLushProgressService jungleService) {
        this.jungleService = jungleService;
    }

    @GetMapping
    public List<JungleLushProgressDTO> getProgress(Principal principal) {
        return jungleService.getProgressForUser(principal.getName());
    }

    @PostMapping("/update")
    public void updateProgress(@RequestBody JungleLushProgressDTO dto, Principal principal) {
        jungleService.updateProgress(principal.getName(), dto);
    }
}
