package com.backend.VocabVenture.dto;

public class JoinRequestResponseDTO {
    private Long requestId;
    private String className;
    private String teacherUsername;
    private boolean approved;

    public JoinRequestResponseDTO(Long requestId, String className, String teacherUsername, boolean approved) {
        this.requestId = requestId;
        this.className = className;
        this.teacherUsername = teacherUsername;
        this.approved = approved;
    }

    public static JoinRequestResponseDTO fromEntity(com.backend.VocabVenture.model.ClassJoinRequest request) {
        return new JoinRequestResponseDTO(
                request.getId(),
                request.getClassObj().getClassName(),
                request.getClassObj().getTeacher().getUsername(),
                request.isApproved());
    }

    // Getters
    public Long getRequestId() {
        return requestId;
    }

    public String getClassName() {
        return className;
    }

    public String getTeacherUsername() {
        return teacherUsername;
    }

    public boolean isApproved() {
        return approved;
    }
}