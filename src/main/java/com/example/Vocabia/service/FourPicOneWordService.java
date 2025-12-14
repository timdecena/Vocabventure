package com.example.Vocabia.service;

import com.example.Vocabia.dto.FourPicOneWordDTO;
import com.example.Vocabia.entity.FourPicOneWord;
import com.example.Vocabia.repository.FourPicOneWordRepository;
import com.example.Vocabia.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FourPicOneWordService {

    private final FourPicOneWordRepository repo;
    private final ClassroomRepository classroomRepository;

    // ==================== CLASSROOM-SPECIFIC METHODS ====================
    
    public Optional<FourPicOneWordDTO> getPuzzleByClassroomAndCategoryAndLevel(Long classroomId, String category, int level) {
        // Repository query already filters by isActive = true, so inactive puzzles are never returned
        return repo.findByClassroomIdAndCategoryAndLevel(classroomId, category, level)
                .map(this::toDto);
    }

    public List<FourPicOneWordDTO> getPuzzlesByClassroomAndCategory(Long classroomId, String category) {
        // Repository query already filters by isActive = true, so inactive puzzles are never returned
        return repo.findByClassroomIdAndCategory(classroomId, category)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<String> getCategoriesByClassroom(Long classroomId) {
        return repo.findDistinctCategoriesByClassroomId(classroomId);
    }

    public List<Integer> getLevelsByClassroomAndCategory(Long classroomId, String category) {
        return repo.findLevelsByClassroomIdAndCategory(classroomId, category);
    }
    
    public Optional<Boolean> getLevelStatusByClassroomAndCategoryAndLevel(Long classroomId, String category, int level) {
        return repo.findLevelStatusByClassroomIdAndCategoryAndLevel(classroomId, category, level);
    }
    
    public int getTotalLevelsByClassroom(Long classroomId) {
        // Count all distinct levels across all categories for this classroom
        return repo.countTotalLevelsByClassroom(classroomId);
    }
    
    public int getTotalLevelsByClassroomAndCategory(Long classroomId, String category) {
        // Count all levels (active and inactive) for this category in this classroom
        return repo.findLevelsByClassroomIdAndCategory(classroomId, category).size();
    }
    
    // ==================== LEGACY METHODS (Adventure Mode) ====================
    
    public Optional<FourPicOneWordDTO> getPuzzleByCategoryAndLevel(String category, int level) {
        // For Adventure Chronicles, try to load from static resources if not in database
        if ("Adventure Chronicles".equalsIgnoreCase(category)) {
            // First try database
            Optional<FourPicOneWordDTO> dbPuzzle = repo.findByCategoryAndLevel(category, level)
                    .map(this::toDto);
            if (dbPuzzle.isPresent()) {
                return dbPuzzle;
            }
            
            // If not in database, try to load from static JSON file
            try {
                FourPicOneWordDTO staticPuzzle = loadAdventureChroniclesPuzzle(level);
                if (staticPuzzle != null) {
                    return Optional.of(staticPuzzle);
                }
            } catch (Exception e) {
                System.err.println("Failed to load Adventure Chronicles puzzle from static resources: " + e.getMessage());
            }
        }
        
        // Repository query already filters by isActive = true, so inactive puzzles are never returned
        return repo.findByCategoryAndLevel(category, level)
                .map(this::toDto);
    }
    
    /**
     * Load Adventure Chronicles puzzle from static JSON file
     */
    private FourPicOneWordDTO loadAdventureChroniclesPuzzle(int level) {
        try {
            // Try to load from Spring Boot resources
            java.io.InputStream is = getClass().getClassLoader()
                    .getResourceAsStream("static/images/Four_Pic_One_Word_Category/Adventure Chronicles/" + level + "/level.json");
            
            if (is == null) {
                // Try React public folder
                java.io.File projectRoot = new java.io.File(System.getProperty("user.dir"));
                java.io.File jsonFile = new java.io.File(projectRoot, 
                    "vocabia-game/public/static/images/Four_Pic_One_Word_Category/Adventure Chronicles/" + level + "/level.json");
                
                if (!jsonFile.exists()) {
                    return null;
                }
                
                is = new java.io.FileInputStream(jsonFile);
            }
            
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode json = mapper.readTree(is);
            is.close();
            
            FourPicOneWordDTO dto = new FourPicOneWordDTO();
            dto.setCategory("Adventure Chronicles");
            dto.setLevel(level);
            dto.setAnswer(json.get("answer").asText());
            dto.setHint(json.has("hint") ? json.get("hint").asText() : null);
            dto.setDifficulty(json.has("difficulty") ? 
                FourPicOneWord.Difficulty.values()[Math.min(json.get("difficulty").asInt() - 1, 2)] : 
                FourPicOneWord.Difficulty.MEDIUM);
            
            // Load images from JSON
            if (json.has("images") && json.get("images").isArray()) {
                com.fasterxml.jackson.databind.JsonNode images = json.get("images");
                if (images.size() > 0) dto.setImage1Url(images.get(0).asText());
                if (images.size() > 1) dto.setImage2Url(images.get(1).asText());
                if (images.size() > 2) dto.setImage3Url(images.get(2).asText());
                if (images.size() > 3) dto.setImage4Url(images.get(3).asText());
            }
            
            return dto;
        } catch (Exception e) {
            System.err.println("Error loading Adventure Chronicles puzzle level " + level + ": " + e.getMessage());
            return null;
        }
    }

    public List<FourPicOneWordDTO> getPuzzlesByCategory(String category) {
        // Repository query already filters by isActive = true, so inactive puzzles are never returned
        return repo.findByCategory(category)
                .stream()
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
    
    /**
     * Get categories created by a specific teacher (only their custom-created categories)
     * This excludes Adventure Mode categories (AdventureChronicles, JungleLush) and static categories
     */
    public List<String> getCategoriesByTeacher(Long teacherId) {
        return repo.findDistinctCategoriesByTeacherId(teacherId);
    }
    
    /**
     * Count only active FPOW levels created by a specific teacher
     */
    public long countActivePuzzlesByTeacher(Long teacherId) {
        return repo.countActivePuzzlesByTeacherId(teacherId);
    }

    public List<Integer> getLevelsByCategory(String category) {
        // Adventure Chronicles always has 10 levels (unlocked based on Adventure Mode progress)
        if ("Adventure Chronicles".equalsIgnoreCase(category)) {
            return List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        }
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

    // ==================== TEACHER FPOW MANAGEMENT METHODS ====================
    
    public List<FourPicOneWordDTO> getAllPuzzlesByTeacher(Long teacherId) {
        return repo.findByTeacherIdOrderByCreatedAtDesc(teacherId)
                .stream()
                .map(puzzle -> {
                    FourPicOneWordDTO dto = toDto(puzzle);
                    // Add classroom name for display
                    classroomRepository.findById(puzzle.getClassroomId())
                            .ifPresent(classroom -> dto.setClassroomName(classroom.getName()));
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    public Optional<FourPicOneWordDTO> getPuzzleByIdAndTeacher(Long id, Long teacherId) {
        return repo.findByIdAndTeacherId(id, teacherId)
                .map(this::toDto);
    }
    
    public FourPicOneWordDTO updatePuzzle(Long id, Long teacherId, FourPicOneWordDTO dto) {
        FourPicOneWord existing = repo.findByIdAndTeacherId(id, teacherId)
                .orElseThrow(() -> new RuntimeException("FPOW puzzle not found or you don't have permission to edit it"));
        
        // Validate image count
        if (dto.getImageCount() < 1) {
            throw new IllegalArgumentException("At least 1 image is required");
        }
        if (dto.getImageCount() > 4) {
            throw new IllegalArgumentException("Maximum 4 images allowed per puzzle");
        }
        
        // Update fields
        existing.setCategory(dto.getCategory());
        existing.setLevel(dto.getLevel());
        existing.setAnswer(dto.getAnswer());
        existing.setHint(dto.getHint());
        existing.setHintType(dto.getHintType());
        existing.setImage1Url(dto.getImage1Url());
        existing.setImage2Url(dto.getImage2Url());
        existing.setImage3Url(dto.getImage3Url());
        existing.setImage4Url(dto.getImage4Url());
        existing.setDifficulty(dto.getDifficulty());
        existing.setActive(dto.isActive());
        
        FourPicOneWord updated = repo.save(existing);
        return toDto(updated);
    }
    
    public void deletePuzzle(Long id, Long teacherId) {
        FourPicOneWord existing = repo.findByIdAndTeacherId(id, teacherId)
                .orElseThrow(() -> new RuntimeException("FPOW puzzle not found or you don't have permission to delete it"));
        
        repo.delete(existing);
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
