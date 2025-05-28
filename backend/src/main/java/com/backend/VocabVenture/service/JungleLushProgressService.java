package com.backend.VocabVenture.service;

import com.backend.VocabVenture.model.JungleLushProgress;
import com.backend.VocabVenture.dto.JungleLushProgressDTO;
import com.backend.VocabVenture.repository.JungleLushProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class JungleLushProgressService {
    @Autowired
    private JungleLushProgressRepository repo;

    public JungleLushProgress getOrCreateForUser(Long userId) {
        return repo.findByUserId(userId).orElseGet(() -> {
            JungleLushProgress progress = new JungleLushProgress();
            progress.setUserId(userId);
            progress.setUnlockedLevel(1);
            progress.setStars(new HashMap<>());
            return repo.save(progress);
        });
    }

    public void saveForUser(Long userId, JungleLushProgressDTO dto) {
        JungleLushProgress progress = getOrCreateForUser(userId);
        progress.setUnlockedLevel(Math.max(progress.getUnlockedLevel(), dto.getUnlockedLevel()));
        Map<Integer, Integer> stars = progress.getStars();
        if (dto.getStars() != null) {
            dto.getStars().forEach((level, star) -> {
                stars.put(level, Math.max(stars.getOrDefault(level, 0), star));
            });
        }
        progress.setStars(stars);
        repo.save(progress);
    }

    public JungleLushProgressDTO toDTO(JungleLushProgress progress) {
        JungleLushProgressDTO dto = new JungleLushProgressDTO();
        dto.setUnlockedLevel(progress.getUnlockedLevel());
        dto.setStars(progress.getStars());
        return dto;
    }
} 