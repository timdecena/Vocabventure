package com.example.Vocabia.adventure.service;

import com.example.Vocabia.adventure.dto.JungleLushProgressDTO;
import com.example.Vocabia.adventure.entity.JungleLushProgress;
import com.example.Vocabia.adventure.repository.JungleLushProgressRepository;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JungleLushProgressService {

    private final JungleLushProgressRepository progressRepo;
    private final UserRepository userRepo;

    public JungleLushProgressService(JungleLushProgressRepository progressRepo, UserRepository userRepo) {
        this.progressRepo = progressRepo;
        this.userRepo = userRepo;
    }

    public List<JungleLushProgressDTO> getProgressForUser(String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        return progressRepo.findByUser(user)
                .stream()
                .map(p -> new JungleLushProgressDTO(p.getIslandName(), p.getCompletedLevel()))
                .collect(Collectors.toList());
    }

    public void updateProgress(String email, JungleLushProgressDTO dto) {
        User user = userRepo.findByEmail(email).orElseThrow();
        JungleLushProgress progress = progressRepo.findByUserAndIslandName(user, dto.getIslandName())
                .orElse(new JungleLushProgress(user, dto.getIslandName(), 0));
        progress.setCompletedLevel(dto.getCompletedLevel());
        progressRepo.save(progress);
    }
}
