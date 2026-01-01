package com.example.taskmanagement.payload.task;

import com.example.taskmanagement.entity.TaskStatus;
import com.example.taskmanagement.entity.TaskPriority;

import java.time.LocalDateTime;

public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private java.time.LocalDateTime dueDate;
    private java.util.List<String> attachments;
    private TaskPriority priority;
    private Long assignedUserId;
    private String assignedUsername;

    public TaskResponse(Long id, String title, String description, TaskStatus status, LocalDateTime createdAt,
            LocalDateTime updatedAt, LocalDateTime dueDate, java.util.List<String> attachments, TaskPriority priority,
            Long assignedUserId, String assignedUsername) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.dueDate = dueDate;
        this.attachments = attachments;
        this.priority = priority;
        this.assignedUserId = assignedUserId;
        this.assignedUsername = assignedUsername;
    }

    public Long getId() {
        return id;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
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

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public java.util.List<String> getAttachments() {
        return attachments;
    }

    public void setAttachments(java.util.List<String> attachments) {
        this.attachments = attachments;
    }

    public Long getAssignedUserId() {
        return assignedUserId;
    }

    public void setAssignedUserId(Long assignedUserId) {
        this.assignedUserId = assignedUserId;
    }

    public String getAssignedUsername() {
        return assignedUsername;
    }

    public void setAssignedUsername(String assignedUsername) {
        this.assignedUsername = assignedUsername;
    }
}
