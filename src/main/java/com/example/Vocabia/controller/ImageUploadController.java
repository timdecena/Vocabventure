package com.example.Vocabia.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ImageUploadController {

    @Value("${image.upload-dir:src/main/resources/static/images}")
    private String uploadDir;

    @PostMapping("/puzzle-image")
    public ResponseEntity<?> uploadPuzzleImage(@RequestParam("file") MultipartFile file,
                                               @RequestParam String category,
                                               @RequestParam String level) throws IOException {
        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        String targetDir = uploadDir + "/" + category + "/" + level + "/";
        File dir = new File(targetDir);
        if (!dir.exists()) dir.mkdirs();

        File targetFile = new File(targetDir + filename);
        file.transferTo(targetFile);

        // Return the URL (for puzzle_images.imageUrl)
        String url = "/images/" + category + "/" + level + "/" + filename;
        Map<String, String> resp = new HashMap<>();
        resp.put("url", url);
        return ResponseEntity.ok(resp);
    }
}
