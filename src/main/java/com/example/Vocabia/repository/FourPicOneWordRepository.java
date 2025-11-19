package com.example.Vocabia.repository;

import com.example.Vocabia.entity.FourPicOneWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FourPicOneWordRepository extends JpaRepository<FourPicOneWord, Long> {

    // Classroom-specific queries
    Optional<FourPicOneWord> findByClassroomIdAndCategoryAndLevel(Long classroomId, String category, int level);
    
    List<FourPicOneWord> findByClassroomIdAndCategory(Long classroomId, String category);
    
    @Query("SELECT DISTINCT f.category FROM FourPicOneWord f WHERE f.classroomId = :classroomId AND f.isActive = true")
    List<String> findDistinctCategoriesByClassroomId(Long classroomId);
    
    @Query("SELECT DISTINCT f.level FROM FourPicOneWord f WHERE f.classroomId = :classroomId AND f.category = :category AND f.isActive = true ORDER BY f.level")
    List<Integer> findLevelsByClassroomIdAndCategory(Long classroomId, String category);
    
    // Legacy methods (kept for backward compatibility with Adventure Mode)
    Optional<FourPicOneWord> findByCategoryAndLevel(String category, int level);
    
    List<FourPicOneWord> findByCategory(String category);
    
    @Query("SELECT DISTINCT f.category FROM FourPicOneWord f WHERE f.isActive = true")
    List<String> findDistinctCategories();
    
    @Query("SELECT DISTINCT f.level FROM FourPicOneWord f WHERE f.category = :category AND f.isActive = true ORDER BY f.level")
    List<Integer> findLevelsByCategory(String category);
}
