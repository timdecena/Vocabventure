package com.example.Vocabia.dto;

import lombok.Data;

@Data
public class CreateChallengeRequest {
    private String word;
    private String definition;
    private String sentence;
    private String audioUrl;
    private Long classroomId;
}
