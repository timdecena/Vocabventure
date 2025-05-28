package com.example.Vocabia.repository;

import com.example.Vocabia.entity.User;
import com.example.Vocabia.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    Optional<UserProgress> findByUser(User user);
    
    /**
     * Find top users by experience points
     */
    @Query(value = "SELECT u.username, up.exp, up.level FROM user_progress up "
            + "JOIN users u ON up.user_id = u.id "
            + "ORDER BY up.exp DESC LIMIT :limit", nativeQuery = true)
    List<Object[]> findTopUsersByExp(@Param("limit") int limit);
    
    /**
     * Find users with experience points greater than a threshold
     */
    @Query("SELECT up FROM UserProgress up WHERE up.exp > :expThreshold ORDER BY up.exp DESC")
    List<UserProgress> findByExpGreaterThan(@Param("expThreshold") int expThreshold);
}
