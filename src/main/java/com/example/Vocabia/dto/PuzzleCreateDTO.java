package com.example.Vocabia.dto;

import java.util.List;

public class PuzzleCreateDTO {
    private String answer;
    private String hint;
    private List<String> imageUrls; // should be 4 items
    private Long levelId;

    // getters and setters
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    public Long getLevelId() { return levelId; }
    public void setLevelId(Long levelId) { this.levelId = levelId; }
}
