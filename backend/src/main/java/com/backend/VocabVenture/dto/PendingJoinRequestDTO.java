package com.backend.VocabVenture.dto;

public class PendingJoinRequestDTO {
    private Long requestId;
    private Long classId;
    private String className;
    private Long studentId;
    private String studentUsername;
    private String studentEmail;
    private boolean approved;

    public PendingJoinRequestDTO(Long requestId, Long classId, String className, Long studentId, String studentUsername, String studentEmail, boolean approved) {
        this.requestId = requestId;
        this.classId = classId;
        this.className = className;
        this.studentId = studentId;
        this.studentUsername = studentUsername;
        this.studentEmail = studentEmail;
        this.approved = approved;
    }

    public static PendingJoinRequestDTO fromEntity(com.backend.VocabVenture.model.ClassJoinRequest request) {
        return new PendingJoinRequestDTO(
            request.getId(),
            request.getClassObj().getId(),
            request.getClassObj().getClassName(),
            request.getStudent().getId(),
            request.getStudent().getUsername(),
            request.getStudent().getEmail(),
            request.isApproved()
        );
    }

    // getters (no setters needed unless you want to update)
}
