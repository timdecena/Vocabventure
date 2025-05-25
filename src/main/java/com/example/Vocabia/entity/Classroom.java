package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "classrooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @Column(unique = true, nullable = false)
    private String joinCode;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private User teacher;
}
