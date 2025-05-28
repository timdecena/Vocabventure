package com.example.Vocabia.dto;

public class LevelDTO {
    private Long id;
    private int number;
    private String name;
    private String description;

    public LevelDTO() {}

    public LevelDTO(Long id, int number, String name, String description) {
        this.id = id;
        this.number = number;
        this.name = name;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getNumber() { return number; }
    public void setNumber(int number) { this.number = number; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
