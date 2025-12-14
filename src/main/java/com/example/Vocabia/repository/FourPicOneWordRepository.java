package com.example.Vocabia.repository;

import com.example.Vocabia.entity.FourPicOneWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FourPicOneWordRepository extends JpaRepository<FourPicOneWord, Long> {

    // Classroom-specific queries (student-facing - only return active puzzles)
    @Query("SELECT f FROM FourPicOneWord f WHERE f.classroomId = :classroomId AND f.category = :category AND f.level = :level AND f.isActive = true")
    Optional<FourPicOneWord> findByClassroomIdAndCategoryAndLevel(Long classroomId, String category, int level);
    
    @Query("SELECT f FROM FourPicOneWord f WHERE f.classroomId = :classroomId AND f.category = :category AND f.isActive = true")
    List<FourPicOneWord> findByClassroomIdAndCategory(Long classroomId, String category);
    
    @Query("SELECT DISTINCT f.category FROM FourPicOneWord f WHERE f.classroomId = :classroomId AND f.isActive = true")
    List<String> findDistinctCategoriesByClassroomId(Long classroomId);
    
    // Return all levels (active and inactive) for listing - frontend will handle inactive display
    @Query("SELECT DISTINCT f.level FROM FourPicOneWord f WHERE f.classroomId = :classroomId AND f.category = :category ORDER BY f.level")
    List<Integer> findLevelsByClassroomIdAndCategory(Long classroomId, String category);
    
    // Get level status (active/inactive) for a specific level
    @Query("SELECT f.isActive FROM FourPicOneWord f WHERE f.classroomId = :classroomId AND f.category = :category AND f.level = :level")
    Optional<Boolean> findLevelStatusByClassroomIdAndCategoryAndLevel(Long classroomId, String category, int level);
    
    // Legacy methods (kept for backward compatibility with Adventure Mode - only return active puzzles)
    @Query("SELECT f FROM FourPicOneWord f WHERE f.category = :category AND f.level = :level AND f.isActive = true")
    Optional<FourPicOneWord> findByCategoryAndLevel(String category, int level);
    
    @Query("SELECT f FROM FourPicOneWord f WHERE f.category = :category AND f.isActive = true")
    List<FourPicOneWord> findByCategory(String category);
    
    @Query("SELECT DISTINCT f.category FROM FourPicOneWord f WHERE f.isActive = true")
    List<String> findDistinctCategories();
    
    @Query("SELECT DISTINCT f.level FROM FourPicOneWord f WHERE f.category = :category AND f.isActive = true ORDER BY f.level")
    List<Integer> findLevelsByCategory(String category);
    
    // Teacher-specific queries for FPOW management
    List<FourPicOneWord> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    
    Optional<FourPicOneWord> findByIdAndTeacherId(Long id, Long teacherId);
    
    // Count total levels for a classroom (all categories combined)
    @Query("SELECT COUNT(DISTINCT f.level) FROM FourPicOneWord f WHERE f.classroomId = :classroomId")
    int countTotalLevelsByClassroom(Long classroomId);
    
    // Get distinct categories created by a specific teacher (across all their classrooms)
    @Query("SELECT DISTINCT f.category FROM FourPicOneWord f WHERE f.teacherId = :teacherId")
    List<String> findDistinctCategoriesByTeacherId(Long teacherId);
    
    // Count only active FPOW levels created by a specific teacher
    @Query("SELECT COUNT(f) FROM FourPicOneWord f WHERE f.teacherId = :teacherId AND f.isActive = true")
    long countActivePuzzlesByTeacherId(Long teacherId);
}
