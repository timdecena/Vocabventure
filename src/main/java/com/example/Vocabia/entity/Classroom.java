package com.example.Vocabia.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
}
