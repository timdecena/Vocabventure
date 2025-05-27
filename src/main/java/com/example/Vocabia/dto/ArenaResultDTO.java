package com.example.Vocabia.dto;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ArenaResultDTO {
    private Long wordListId;
    private List<ArenaAnswerDTO> answers;
}
