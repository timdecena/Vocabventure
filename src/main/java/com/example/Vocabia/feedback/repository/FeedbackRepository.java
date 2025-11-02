package com.example.Vocabia.feedback.repository;

import com.example.Vocabia.feedback.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    // Find all feedback ordered by submission date (newest first)
    List<Feedback> findAllByOrderBySubmittedAtDesc();
    
    // Find all feedback ordered by rating (highest first)
    List<Feedback> findAllByOrderByRatingDesc();
    
    // Find feedback by rating
    List<Feedback> findByRating(Integer rating);
}

