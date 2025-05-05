package com.backend.VocabVenture.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "classes")
public class Class {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Length(max = 100)
    private String className;

    @Size(max = 500)
    private String description;

    @Column(unique = true, nullable = false)
    private String joinCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToMany
    @JoinTable(
            name = "class_students",
            joinColumns = @JoinColumn(name = "class_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private Set<User> students = new HashSet<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Class() {
        this.joinCode = generateJoinCode();
    }

    public Class(String className, String description, User teacher) {
        this.className = className;
        this.description = description;
        this.teacher = teacher;
        this.joinCode = generateJoinCode();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Generate a unique join code
    private String generateJoinCode() {
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    // Methods to manage students
    public void addStudent(User student) {
        if (student.getRole() == Role.STUDENT) {
            students.add(student);
        }
    }

    public void removeStudent(User student) {
        students.remove(student);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getJoinCode() {
        return joinCode;
    }

    public void setJoinCode(String joinCode) {
        this.joinCode = joinCode;
    }

    public User getTeacher() {
        return teacher;
    }

    public void setTeacher(User teacher) {
        this.teacher = teacher;
    }

    public Set<User> getStudents() {
        return students;
    }

    public void setStudents(Set<User> students) {
        this.students = students;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Regenerate join code method
    public void regenerateJoinCode() {
        this.joinCode = generateJoinCode();
        this.updatedAt = LocalDateTime.now();
    }

    // Builder pattern
    public static ClassBuilder builder() {
        return new ClassBuilder();
    }

    // Builder class
    public static class ClassBuilder {
        private String className;
        private String description;
        private User teacher;

        ClassBuilder() {
        }

        public ClassBuilder className(String className) {
            this.className = className;
            return this;
        }

        public ClassBuilder description(String description) {
            this.description = description;
            return this;
        }

        public ClassBuilder teacher(User teacher) {
            this.teacher = teacher;
            return this;
        }

        public Class build() {
            return new Class(className, description, teacher);
        }
    }
}
