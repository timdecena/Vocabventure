package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.dto.JungleLushProgressDTO;
import com.backend.VocabVenture.model.JungleLushProgress;
import com.backend.VocabVenture.service.JungleLushProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress/jungle-lush")
public class JungleLushProgressController {
    @Autowired
    private JungleLushProgressService service;

    @GetMapping
    public ResponseEntity<JungleLushProgressDTO> getProgress(@AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        Long userId = Long.valueOf(user.getUsername()); // Adjust as needed for your user model
        JungleLushProgress progress = service.getOrCreateForUser(userId);
        return ResponseEntity.ok(service.toDTO(progress));
    }

    @PostMapping
    public ResponseEntity<?> saveProgress(@AuthenticationPrincipal org.springframework.security.core.userdetails.User user,
                                          @RequestBody JungleLushProgressDTO dto) {
        Long userId = Long.valueOf(user.getUsername()); // Adjust as needed for your user model
        service.saveForUser(userId, dto);
        return ResponseEntity.ok().build();
    }
} 