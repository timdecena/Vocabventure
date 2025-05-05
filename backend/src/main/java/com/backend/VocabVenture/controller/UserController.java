package com.backend.VocabVenture.controller;

import com.backend.VocabVenture.dto.ProfilePictureResponse;
import com.backend.VocabVenture.dto.UserDTO;
import com.backend.VocabVenture.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "User management API endpoints")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @GetMapping("/me/profile-picture")
    public ResponseEntity<byte[]> getProfilePicture() {
        String username = userService.getCurrentUser().getUsername();
        byte[] image = userService.getProfilePicture(username);
        String contentType = userService.getProfilePictureContentType(username);

        if (image == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(image);
    }

    @PostMapping(value = "/me/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            String username = userService.getCurrentUser().getUsername();
            ProfilePictureResponse response = userService.updateProfilePicture(username, file);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(new ProfilePictureResponse("Failed to process image: " + e.getMessage(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ProfilePictureResponse(e.getMessage(), null));
        }
    }
}
