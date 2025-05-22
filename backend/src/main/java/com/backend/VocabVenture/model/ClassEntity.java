package com.backend.VocabVenture.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "classes", uniqueConstraints = @UniqueConstraint(columnNames = "joinCode"))
public class ClassEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String className;
    private String description;

    @Column(nullable = false, unique = true)
    private String joinCode;

    @ManyToOne(optional = false)
    @JoinColumn(name = "teacher_id")
    private User teacher;

    @ManyToMany
    @JoinTable(
        name = "class_students",
        joinColumns = @JoinColumn(name = "class_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private List<User> students = new ArrayList<>();

    // existing constructor, getters, setters...


    

    // Constructors
    public ClassEntity() {}

    public ClassEntity(String className, String description, User teacher) {
        this.className = className;
        this.description = description;
        this.teacher = teacher;
        this.joinCode = generateJoinCode();
    }

    private String generateJoinCode() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    // Getters and Setters
    public Long getId() { return id; }

    public String getClassName() { return className; }

    public void setClassName(String className) { this.className = className; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public String getJoinCode() { return joinCode; }

    public User getTeacher() { return teacher; }

    public void setTeacher(User teacher) { this.teacher = teacher; }

    public List<User> getStudents() { return students;}

    public void setStudents(List<User> students) { this.students = students; }
}
