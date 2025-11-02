package com.example.Vocabia.dto;

import com.example.Vocabia.entity.FourPicOneWord.Difficulty;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FourPicOneWordDTO {
    private Long id;
    private Long classroomId;
    private Long teacherId;
    private String category;
    private int level;
    private String answer;
    private String hint;
    private String hintType;
    private String image1Url;
    private String image2Url;
    private String image3Url;
    private String image4Url;
    private Difficulty difficulty;
    private boolean isActive;
    private LocalDateTime createdAt;
    
    // ✅ Computed field for image count
    public int getImageCount() {
        int count = 0;
        if (image1Url != null && !image1Url.trim().isEmpty()) count++;
        if (image2Url != null && !image2Url.trim().isEmpty()) count++;
        if (image3Url != null && !image3Url.trim().isEmpty()) count++;
        if (image4Url != null && !image4Url.trim().isEmpty()) count++;
        return count;
    }
    
    // ✅ Helper method to get all non-null image URLs
    public java.util.List<String> getImageUrls() {
        java.util.List<String> urls = new java.util.ArrayList<>();
        if (image1Url != null && !image1Url.trim().isEmpty()) urls.add(image1Url);
        if (image2Url != null && !image2Url.trim().isEmpty()) urls.add(image2Url);
        if (image3Url != null && !image3Url.trim().isEmpty()) urls.add(image3Url);
        if (image4Url != null && !image4Url.trim().isEmpty()) urls.add(image4Url);
        return urls;
    }
}
