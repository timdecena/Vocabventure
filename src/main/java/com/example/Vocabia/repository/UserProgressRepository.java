package com.example.Vocabia.repository;

import com.example.Vocabia.entity.UserProgress;
import com.example.Vocabia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {

    List<UserProgress> findByUser(User user);

    Optional<UserProgress> findByUserAndCategory(User user, String category);

    List<UserProgress> findByCategory(String category);

    List<UserProgress> findTop10ByCategoryOrderByCurrentXpDesc(String category);

    @Query("SELECT u FROM UserProgress u ORDER BY u.currentXp DESC")
    List<UserProgress> findTop10Global();
}
