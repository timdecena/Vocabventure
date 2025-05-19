package com.vocabventure.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "experience_points", columnDefinition = "INT DEFAULT 0")
    private Integer experiencePoints = 0;

    @Column(name = "user_level", columnDefinition = "INT DEFAULT 1")
    private Integer userLevel = 1;
} 