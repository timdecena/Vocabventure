package com.example.Vocabia.dto;

public interface WOTDLeaderboardEntryDTO {
    Long getStudentId();
    String getStudentName();
    Integer getTotalPlayed();
    Integer getCorrectAnswers();
    Double getAccuracyPercent();
}
