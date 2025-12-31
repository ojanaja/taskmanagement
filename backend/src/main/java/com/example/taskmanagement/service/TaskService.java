package com.example.taskmanagement.service;

import com.example.taskmanagement.payload.task.TaskRequest;
import com.example.taskmanagement.payload.task.TaskResponse;

import java.util.List;

public interface TaskService {
    List<TaskResponse> getAllTasks(Long userId);

    TaskResponse createTask(Long userId, TaskRequest taskRequest);

    TaskResponse updateTask(Long userId, Long taskId, TaskRequest taskRequest);

    void deleteTask(Long userId, Long taskId);

    TaskResponse getTaskById(Long userId, Long taskId);
}
