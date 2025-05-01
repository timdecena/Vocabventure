package com.backend.VocabVenture.dto;

import javax.validation.constraints.NotBlank;

public class ClassRequestDTO {

    @NotBlank(message = "Class name is required")
    private String className;

    private String description;

    // Getters and Setters
    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}