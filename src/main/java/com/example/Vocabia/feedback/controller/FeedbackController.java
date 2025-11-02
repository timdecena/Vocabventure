package com.example.Vocabia.feedback.controller;

import com.example.Vocabia.feedback.entity.Feedback;
import com.example.Vocabia.feedback.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {
    
    private final FeedbackService feedbackService;
    
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }
    
    /**
     * Submit new feedback (public endpoint - no authentication required)
     */
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitFeedback(@RequestBody Feedback feedback) {
        try {
            // Validate input
            if (feedback.getName() == null || feedback.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Name is required"));
            }
            if (feedback.getEmail() == null || feedback.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email is required"));
            }
            if (feedback.getGrade() == null || feedback.getGrade().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Grade is required"));
            }
            if (feedback.getRating() == null || feedback.getRating() < 1 || feedback.getRating() > 5) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Rating must be between 1 and 5"));
            }
            
            Feedback savedFeedback = feedbackService.submitFeedback(feedback);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thank you for your feedback!");
            response.put("feedback", savedFeedback);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to submit feedback: " + e.getMessage()));
        }
    }
    
    /**
     * Get all feedback sorted by date (admin only)
     */
    @GetMapping("/all")
    public ResponseEntity<List<Feedback>> getAllFeedback(@RequestParam(defaultValue = "date") String sortBy) {
        try {
            List<Feedback> feedbackList;
            if ("rating".equalsIgnoreCase(sortBy)) {
                feedbackList = feedbackService.getAllFeedbackByRating();
            } else {
                feedbackList = feedbackService.getAllFeedbackByDate();
            }
            return ResponseEntity.ok(feedbackList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get feedback statistics (admin only)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getFeedbackStats() {
        try {
            long totalCount = feedbackService.getTotalFeedbackCount();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalFeedback", totalCount);
            stats.put("fiveStars", feedbackService.getFeedbackByRating(5).size());
            stats.put("fourStars", feedbackService.getFeedbackByRating(4).size());
            stats.put("threeStars", feedbackService.getFeedbackByRating(3).size());
            stats.put("twoStars", feedbackService.getFeedbackByRating(2).size());
            stats.put("oneStar", feedbackService.getFeedbackByRating(1).size());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Delete feedback (admin only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteFeedback(@PathVariable Long id) {
        try {
            feedbackService.deleteFeedback(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Feedback deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to delete feedback"));
        }
    }
}

