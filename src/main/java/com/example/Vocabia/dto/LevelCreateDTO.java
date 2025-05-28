package com.example.Vocabia.dto;

public class LevelCreateDTO {
    private String name;
    private String description;
    private int number;
    private Long classroomId; // nullable for global

    // getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getNumber() { return number; }
    public void setNumber(int number) { this.number = number; }
    public Long getClassroomId() { return classroomId; }
    public void setClassroomId(Long classroomId) { this.classroomId = classroomId; }
}
