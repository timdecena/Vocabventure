package com.example.Vocabia.adventure.repository;

import com.example.Vocabia.adventure.entity.IslandProgress;
import com.example.Vocabia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IslandProgressRepository extends JpaRepository<IslandProgress, Long> {
    
    /**
     * Find all island progress for a specific user
     */
    List<IslandProgress> findByUser(User user);
    
    /**
     * Find progress for a specific user and island
     */
    Optional<IslandProgress> findByUserAndIslandName(User user, String islandName);
    
    /**
     * Find all users who have completed at least one level on a specific island
     */
    @Query("SELECT ip FROM IslandProgress ip WHERE ip.islandName = :islandName AND ip.completedLevel > 0")
    List<IslandProgress> findUsersWithProgressOnIsland(@Param("islandName") String islandName);
    
    /**
     * Get the highest completed level for a user on a specific island
     */
    @Query("SELECT COALESCE(MAX(ip.completedLevel), 0) FROM IslandProgress ip WHERE ip.user = :user AND ip.islandName = :islandName")
    int getHighestCompletedLevel(@Param("user") User user, @Param("islandName") String islandName);
    
    /**
     * Get total stars earned by a user on a specific island
     */
    @Query("SELECT COALESCE(ip.totalStars, 0) FROM IslandProgress ip WHERE ip.user = :user AND ip.islandName = :islandName")
    int getTotalStarsForIsland(@Param("user") User user, @Param("islandName") String islandName);
    
    /**
     * Get total stars earned by a user across all islands
     */
    @Query("SELECT COALESCE(SUM(ip.totalStars), 0) FROM IslandProgress ip WHERE ip.user = :user")
    int getTotalStarsForUser(@Param("user") User user);
    
    /**
     * Check if user has completed a specific level on an island
     */
    @Query("SELECT CASE WHEN ip.completedLevel >= :level THEN true ELSE false END FROM IslandProgress ip WHERE ip.user = :user AND ip.islandName = :islandName")
    boolean hasCompletedLevel(@Param("user") User user, @Param("islandName") String islandName, @Param("level") int level);
}
