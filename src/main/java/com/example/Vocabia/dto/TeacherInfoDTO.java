package com.example.Vocabia.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TeacherInfoDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String avatar;
}
