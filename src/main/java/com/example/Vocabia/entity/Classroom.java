package com.example.Vocabia.entity;

import jakarta.persistence.*;
<<<<<<< HEAD

@Entity
@Table(name = "classrooms")
=======
import java.util.HashSet;
import java.util.Set;

@Entity
>>>>>>> 9c235d03163cc3f9d8a9c7738f6667321e880070
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

<<<<<<< HEAD
    private String name;
    private String description;

    @Column(unique = true, nullable = false)
    private String joinCode;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private User teacher;

    // Constructors
    public Classroom() {}

    public Classroom(String name, String description, String joinCode, User teacher) {
        this.name = name;
        this.description = description;
        this.joinCode = joinCode;
        this.teacher = teacher;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getJoinCode() { return joinCode; }
    public void setJoinCode(String joinCode) { this.joinCode = joinCode; }

    public User getTeacher() { return teacher; }
    public void setTeacher(User teacher) { this.teacher = teacher; }
=======
    private String className;

    @ManyToOne
    private UserEntity teacher;

    @ManyToMany
    @JoinTable(
        name = "classroom_students",
        joinColumns = @JoinColumn(name = "classroom_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private Set<UserEntity> acceptedStudents = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "classroom_pending",
        joinColumns = @JoinColumn(name = "classroom_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private Set<UserEntity> pendingRequests = new HashSet<>();

    // --- Getters and Setters ---

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

    public UserEntity getTeacher() {
        return teacher;
    }

    public void setTeacher(UserEntity teacher) {
        this.teacher = teacher;
    }

    public Set<UserEntity> getAcceptedStudents() {
        return acceptedStudents;
    }

    public void setAcceptedStudents(Set<UserEntity> acceptedStudents) {
        this.acceptedStudents = acceptedStudents;
    }

    public Set<UserEntity> getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(Set<UserEntity> pendingRequests) {
        this.pendingRequests = pendingRequests;
    }
>>>>>>> 9c235d03163cc3f9d8a9c7738f6667321e880070
}
