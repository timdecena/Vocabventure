package com.example.Vocabia.adventure.dto;

public class LevelCompletionRequest {
    private Long levelId;
    private int score;
    private int timeTaken;

    public LevelCompletionRequest() {
    }

    public LevelCompletionRequest(Long levelId, int score, int timeTaken) {
        this.levelId = levelId;
        this.score = score;
        this.timeTaken = timeTaken;
    }

    public Long getLevelId() {
        return levelId;
    }

    public void setLevelId(Long levelId) {
        this.levelId = levelId;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getTimeTaken() {
        return timeTaken;
    }

    public void setTimeTaken(int timeTaken) {
        this.timeTaken = timeTaken;
    }
}
