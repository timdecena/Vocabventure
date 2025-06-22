package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    private String firstName;
    private String lastName;

    @Column(unique = true)
    private String email;

    private String password;
    private String role; // "STUDENT" or "TEACHER"

    @Column(nullable = false)
    private int gold = 0; // Only used for STUDENTs

    @Column(nullable = false)
    private int correctAnswers = 0;

    @Column(nullable = false)
    private int progressPoints = 0;
    
    @Lob
    @Column(name = "profile_image", columnDefinition = "MEDIUMBLOB")
    private byte[] profileImage; // Store profile image as binary
}
