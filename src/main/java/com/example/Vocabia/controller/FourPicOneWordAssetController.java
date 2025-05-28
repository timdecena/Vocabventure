package com.example.Vocabia.controller;

import com.example.Vocabia.dto.FourPicOneWordPuzzleDTO;
import com.example.Vocabia.service.FourPicOneWordAssetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/4pic1word-assets")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class FourPicOneWordAssetController {

    private final FourPicOneWordAssetService assetService;

    public FourPicOneWordAssetController(FourPicOneWordAssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping("/categories")
    public List<String> getAllCategories() {
        return assetService.getAllCategories();
    }

    @GetMapping("/categories/{category}/levels")
    public List<String> getLevels(@PathVariable String category) {
        return assetService.getLevelsForCategory(category);
    }

    @GetMapping("/categories/{category}/levels/{level}")
    public FourPicOneWordPuzzleDTO getFourPicOneWord(@PathVariable String category, @PathVariable String level) {
        return assetService.loadFourPicOneWord(category, level);
    }
}
