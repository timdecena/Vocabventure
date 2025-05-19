package com.vocabventure.service;

import com.vocabventure.dto.AdventureLevelStatsDTO;
import com.vocabventure.entity.AdventureLevelStats;
import com.vocabventure.entity.User;
import com.vocabventure.repository.AdventureLevelStatsRepository;
import com.vocabventure.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdventureLevelStatsService {

    @Autowired
    private AdventureLevelStatsRepository statsRepository;

    @Autowired
    private UserRepository userRepository;

    public List<AdventureLevelStatsDTO> getLevelStats(Long userId, Integer islandId) {
        List<AdventureLevelStats> stats = statsRepository.findByUserIdAndIslandId(userId, islandId);
        return stats.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdventureLevelStatsDTO saveLevelStats(AdventureLevelStatsDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<AdventureLevelStats> existingStats = statsRepository
                .findByUserIdAndIslandIdAndLevelNumber(dto.getUserId(), dto.getIslandId(), dto.getLevelNumber());

        AdventureLevelStats stats;
        if (existingStats.isPresent()) {
            stats = existingStats.get();
            // Update only if new score is better
            if (dto.getBestScore() != null && 
                (stats.getBestScore() == null || dto.getBestScore() > stats.getBestScore())) {
                stats.setBestScore(dto.getBestScore());
            }
            // Update stars if new result is better
            if (dto.getStarsEarned() != null && 
                (stats.getStarsEarned() == null || dto.getStarsEarned() > stats.getStarsEarned())) {
                stats.setStarsEarned(dto.getStarsEarned());
            }
        } else {
            stats = new AdventureLevelStats();
            stats.setUser(user);
            stats.setIslandId(dto.getIslandId());
            stats.setLevelNumber(dto.getLevelNumber());
            stats.setStarsEarned(dto.getStarsEarned());
            stats.setBestScore(dto.getBestScore());
        }

        stats.setCompleted(dto.getCompleted());
        stats.setAttempts(stats.getAttempts() + 1);
        stats.setLastAttempted(LocalDateTime.now());

        AdventureLevelStats savedStats = statsRepository.save(stats);
        return convertToDTO(savedStats);
    }

    private AdventureLevelStatsDTO convertToDTO(AdventureLevelStats stats) {
        AdventureLevelStatsDTO dto = new AdventureLevelStatsDTO();
        dto.setUserId(stats.getUser().getId());
        dto.setIslandId(stats.getIslandId());
        dto.setLevelNumber(stats.getLevelNumber());
        dto.setStarsEarned(stats.getStarsEarned());
        dto.setCompleted(stats.getCompleted());
        dto.setBestScore(stats.getBestScore());
        return dto;
    }
} 