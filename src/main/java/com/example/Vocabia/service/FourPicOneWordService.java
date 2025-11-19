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

    // ==================== CLASSROOM-SPECIFIC METHODS ====================
    
    public Optional<FourPicOneWordDTO> getPuzzleByClassroomAndCategoryAndLevel(Long classroomId, String category, int level) {
        return repo.findByClassroomIdAndCategoryAndLevel(classroomId, category, level)
                .filter(FourPicOneWord::isActive)
                .map(this::toDto);
    }

    public List<FourPicOneWordDTO> getPuzzlesByClassroomAndCategory(Long classroomId, String category) {
        return repo.findByClassroomIdAndCategory(classroomId, category)
                .stream()
                .filter(FourPicOneWord::isActive)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<String> getCategoriesByClassroom(Long classroomId) {
        return repo.findDistinctCategoriesByClassroomId(classroomId);
    }

    public List<Integer> getLevelsByClassroomAndCategory(Long classroomId, String category) {
        return repo.findLevelsByClassroomIdAndCategory(classroomId, category);
    }
    
    // ==================== LEGACY METHODS (Adventure Mode) ====================
    
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
        // Filter out static pre-configured categories (except Adventure Mode)
        // Only show teacher-created categories
        List<String> allCategories = repo.findDistinctCategories();
        
        // List of static categories to exclude (these were pre-configured)
        List<String> staticCategoriesToExclude = List.of(
            "Animals", "Fruits", "Objects", "Homophones", 
            "Synonyms", "Antonyms", "Prefixes & Suffixes"
        );
        
        // Keep Adventure Chronicles and Jungle Lush (Adventure Mode content)
        // and any teacher-created categories
        return allCategories.stream()
            .filter(cat -> !staticCategoriesToExclude.contains(cat))
            .collect(Collectors.toList());
    }

    public List<Integer> getLevelsByCategory(String category) {
        return repo.findLevelsByCategory(category);
    }

    // ✅ Create classroom-specific puzzle (teacher use) - supports 1-4 images
    public FourPicOneWordDTO createPuzzle(FourPicOneWordDTO dto, Long classroomId, Long teacherId) {
        // ✅ Validate minimum image requirement (at least 1 image)
        if (dto.getImageCount() < 1) {
            throw new IllegalArgumentException("At least 1 image is required to create a puzzle");
        }
        
        // ✅ Validate maximum image limit (up to 4 images)
        if (dto.getImageCount() > 4) {
            throw new IllegalArgumentException("Maximum 4 images allowed per puzzle");
        }
        
        // ✅ Validate required fields
        if (classroomId == null) {
            throw new IllegalArgumentException("Classroom ID is required");
        }
        if (teacherId == null) {
            throw new IllegalArgumentException("Teacher ID is required");
        }
        
        FourPicOneWord entity = FourPicOneWord.builder()
                .classroomId(classroomId)
                .teacherId(teacherId)
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
                .classroomId(e.getClassroomId())
                .teacherId(e.getTeacherId())
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
