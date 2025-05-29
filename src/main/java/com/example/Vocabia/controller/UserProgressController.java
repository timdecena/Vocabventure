package com.example.Vocabia.controller;

import com.example.Vocabia.dto.CompletePuzzleRequest;
import com.example.Vocabia.dto.UserProgressDTO;
import com.example.Vocabia.entity.FourPicOneWordPuzzle;
import com.example.Vocabia.entity.User;
import com.example.Vocabia.exception.ResourceNotFoundException;
import com.example.Vocabia.repository.FourPicOneWordPuzzleRepository;
import com.example.Vocabia.repository.UserRepository;
import com.example.Vocabia.service.GameProgressionService;
import com.example.Vocabia.service.UserProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * Controller for managing user progress and game completion.
 */
@Slf4j

@Tag(name = "User Progress", description = "APIs for managing user progress and game completion")
@RestController
@RequestMapping("/api/user/progress")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:3000}", allowCredentials = "true")
@RequiredArgsConstructor
public class UserProgressController {

    private final UserRepository userRepository;
    private final FourPicOneWordPuzzleRepository puzzleRepository;
    private final GameProgressionService gameProgressionService;
    private final UserProgressService userProgressService;

        /**
     * Get the user's progress.
     *
     * @param principal the authenticated user
     * @return UserProgressDTO containing progress information
     */
    @Operation(
        summary = "Get user progress",
        description = "Retrieves the progress of the authenticated user"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved user progress"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
        @ApiResponse(responseCode = "404", description = "User progress not found")
    })
    @GetMapping
    public ResponseEntity<UserProgressDTO> getProgress(Principal principal) {
        log.info("Fetching progress for user: {}", principal.getName());
        UserProgressDTO progress = gameProgressionService.getUserProgress(principal.getName());
        return ResponseEntity.ok(progress);
    }

    /**
     * Mark a puzzle as completed and add EXP, then return updated progress.
     *
     * @param principal the authenticated user
     * @param request the completion request containing puzzle ID and EXP
     * @return updated UserProgressDTO
     */
    @Operation(
        summary = "Complete puzzle",
        description = "Marks a puzzle as completed and updates user progress with earned EXP"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Puzzle completed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
        @ApiResponse(responseCode = "404", description = "User or puzzle not found")
    })
    @PostMapping("/complete-puzzle")
    public ResponseEntity<UserProgressDTO> completePuzzle(
            Principal principal,
            @Valid @RequestBody CompletePuzzleRequest request) {
        
        log.info("Completing puzzle for user: {}, puzzleId: {}", 
                principal.getName(), request.getPuzzleId());
        
        // Find user
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", principal.getName()));

        // Find puzzle
        FourPicOneWordPuzzle puzzle = puzzleRepository.findById(request.getPuzzleId())
                .orElseThrow(() -> new ResourceNotFoundException("Puzzle", "id", request.getPuzzleId()));

        try {
            // Update user progress with puzzle completion
            int expEarned = userProgressService.addExpForPuzzle(
                user, 
                puzzle, 
                request.getTimeTaken(), 
                request.getHintsUsed()
            );
            
            // Return updated progress
            UserProgressDTO updatedProgress = gameProgressionService.getUserProgress(
                    principal.getName());
                    
            log.info("Successfully completed puzzle for user: {}, earned {} XP, new level: {}", 
                    principal.getName(), expEarned, updatedProgress.getLevel());
                    
            return ResponseEntity.ok(updatedProgress);
            
        } catch (Exception e) {
            log.error("Error completing puzzle for user: " + principal.getName(), e);
            throw e; // Let the global exception handler handle it
        }
    }
}
