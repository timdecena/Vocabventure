package com.example.Vocabia.service;

import com.example.Vocabia.dto.FourPicOneWordDTO;
import com.example.Vocabia.entity.FourPicOneWord;
import com.example.Vocabia.repository.FourPicOneWordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FourPicOneWordService {

    private final FourPicOneWordRepository repo;

    public Optional<FourPicOneWordDTO> getPuzzleByCategoryAndLevel(String category, int level) {
        return repo.findByCategoryAndLevel(category, level)
                .filter(FourPicOneWord::isActive)
                .map(this::toDto);
    }

    public List<FourPicOneWordDTO> getPuzzlesByCategory(String category) {
        return repo.findByCategory(category)
                .stream()
                .filter(FourPicOneWord::isActive)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<String> getCategories() {
        return repo.findDistinctCategories();
    }

    public List<Integer> getLevelsByCategory(String category) {
        return repo.findLevelsByCategory(category);
    }

    // ✅ NEW: Create custom puzzle (teacher use)
    public FourPicOneWordDTO createPuzzle(FourPicOneWordDTO dto, String teacherEmail) {
        // Optional: Add validation (e.g., verify teacher owns class)
        FourPicOneWord entity = FourPicOneWord.builder()
                .category(dto.getCategory())
                .level(dto.getLevel())
                .answer(dto.getAnswer())
                .hint(dto.getHint())
                .hintType(dto.getHintType())
                .image1Url(dto.getImage1Url())
                .image2Url(dto.getImage2Url())
                .image3Url(dto.getImage3Url())
                .image4Url(dto.getImage4Url())
                .difficulty(dto.getDifficulty())
                .isActive(true)
                .build();

        FourPicOneWord saved = repo.save(entity);
        return toDto(saved);
    }

    private FourPicOneWordDTO toDto(FourPicOneWord e) {
        return FourPicOneWordDTO.builder()
                .id(e.getId())
                .category(e.getCategory())
                .level(e.getLevel())
                .answer(e.getAnswer())
                .hint(e.getHint())
                .hintType(e.getHintType())
                .image1Url(e.getImage1Url())
                .image2Url(e.getImage2Url())
                .image3Url(e.getImage3Url())
                .image4Url(e.getImage4Url())
                .difficulty(e.getDifficulty())
                .isActive(e.isActive())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
