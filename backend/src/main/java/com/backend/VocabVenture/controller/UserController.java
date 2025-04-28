package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.dto.ProfilePictureResponse;
import com.backend.VocabVenture.dto.UserDTO;
import com.backend.VocabVenture.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "User management API endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Get current user", description = "Returns the details of the currently authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User details retrieved successfully",
                    content = @Content(schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - not authenticated")
    })
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @Operation(summary = "Get current user's profile picture", description = "Returns the profile picture of the currently authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Profile picture retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - not authenticated"),
            @ApiResponse(responseCode = "404", description = "User not found or no profile picture set")
    })
    @GetMapping("/me/profile-picture")
    public ResponseEntity<byte[]> getProfilePicture() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        byte[] image = userService.getProfilePicture(username);
        String contentType = userService.getProfilePictureContentType(username);

        if (image == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(image);
    }

    @Operation(summary = "Upload profile picture", description = "Upload a profile picture for the current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Profile picture uploaded successfully",
                    content = @Content(schema = @Schema(implementation = ProfilePictureResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid file format or size"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - not authenticated")
    })
    @PostMapping(value = "/me/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfilePictureResponse> uploadProfilePicture(
            @RequestParam("file") MultipartFile file) throws IOException {
        ProfilePictureResponse response = userService.updateProfilePicture(
                SecurityContextHolder.getContext().getAuthentication().getName(),
                file
        );
        return ResponseEntity.ok(response);
    }
}