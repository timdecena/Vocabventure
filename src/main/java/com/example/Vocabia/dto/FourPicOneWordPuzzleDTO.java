package com.example.Vocabia.dto;

import java.util.List;

public class FourPicOneWordPuzzleDTO {
    private Long id;
    private String answer;
    private String hint;
    private List<String> images;
    private Long levelId;
    private List<String> letterTiles; // Add this line

    public FourPicOneWordPuzzleDTO() {}

    public FourPicOneWordPuzzleDTO(Long id, String answer, String hint, List<String> images, Long levelId) {
        this.id = id;
        this.answer = answer;
        this.hint = hint;
        this.images = images;
        this.levelId = levelId;
    }

    // Add this constructor
    public FourPicOneWordPuzzleDTO(String answer, String hint, List<String> images) {
        this.answer = answer;
        this.hint = hint;
        this.images = images;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public Long getLevelId() { return levelId; }
    public void setLevelId(Long levelId) { this.levelId = levelId; }

    // Add these getter/setter
    public List<String> getLetterTiles() { return letterTiles; }
    public void setLetterTiles(List<String> letterTiles) { this.letterTiles = letterTiles; }
}
