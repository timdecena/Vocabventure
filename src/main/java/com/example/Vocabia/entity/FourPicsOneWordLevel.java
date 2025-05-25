package com.example.Vocabia.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FourPicsOneWordLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String word;
    private String definition;
    private String image1Url;
    private String image2Url;
    private String image3Url;
    private String image4Url;

    private boolean isGlobal;

    @ManyToOne
    private Classroom classroom;
}
