package com.example.Vocabia.feedback.service;

import com.example.Vocabia.feedback.entity.Feedback;
import com.example.Vocabia.feedback.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {
    
    private final FeedbackRepository feedbackRepository;
    
    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }
    
    /**
     * Submit new feedback
     */
    public Feedback submitFeedback(Feedback feedback) {
        return feedbackRepository.save(feedback);
    }
    
    /**
     * Get all feedback sorted by date (newest first)
     */
    public List<Feedback> getAllFeedbackByDate() {
        return feedbackRepository.findAllByOrderBySubmittedAtDesc();
    }
    
    /**
     * Get all feedback sorted by rating (highest first)
     */
    public List<Feedback> getAllFeedbackByRating() {
        return feedbackRepository.findAllByOrderByRatingDesc();
    }
    
    /**
     * Get feedback by specific rating
     */
    public List<Feedback> getFeedbackByRating(Integer rating) {
        return feedbackRepository.findByRating(rating);
    }
    
    /**
     * Get total feedback count
     */
    public long getTotalFeedbackCount() {
        return feedbackRepository.count();
    }
    
    /**
     * Delete feedback by ID
     */
    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }
}

