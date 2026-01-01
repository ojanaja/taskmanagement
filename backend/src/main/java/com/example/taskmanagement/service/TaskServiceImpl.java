package com.example.taskmanagement.service;

import com.example.taskmanagement.entity.User;
import com.example.taskmanagement.repository.UserRepository;
import com.example.taskmanagement.entity.Task;
import com.example.taskmanagement.entity.TaskStatus;
import com.example.taskmanagement.entity.TaskPriority;
import com.example.taskmanagement.exception.ResourceNotFoundException;
import com.example.taskmanagement.payload.task.TaskRequest;
import com.example.taskmanagement.payload.task.TaskResponse;
import com.example.taskmanagement.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<TaskResponse> getAllTasks(Long userId) {
        List<Task> tasks = taskRepository.findAll();
        return tasks.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TaskResponse createTask(Long userId, TaskRequest taskRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Task task = new Task();
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setStatus(TaskStatus.PENDING);
        if (taskRequest.getStatus() != null) {
            try {
                task.setStatus(TaskStatus.valueOf(taskRequest.getStatus()));
            } catch (IllegalArgumentException e) {
            }
        }

        if (taskRequest.getPriority() != null) {
            try {
                task.setPriority(TaskPriority.valueOf(taskRequest.getPriority()));
            } catch (IllegalArgumentException e) {
            }
        }

        if (taskRequest.getAssignedUserId() != null) {
            User assignedUser = userRepository.findById(taskRequest.getAssignedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned User not found"));
            task.setAssignedUser(assignedUser);
        }

        task.setUser(user);
        task.setDueDate(taskRequest.getDueDate());
        task.setAttachments(taskRequest.getAttachments());

        Task savedTask = taskRepository.save(task);
        return mapToResponse(savedTask);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long userId, Long taskId, TaskRequest taskRequest) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        if (taskRequest.getStatus() != null) {
            try {
                task.setStatus(TaskStatus.valueOf(taskRequest.getStatus()));
            } catch (IllegalArgumentException e) {
            }
        }
        if (taskRequest.getPriority() != null) {
            try {
                task.setPriority(TaskPriority.valueOf(taskRequest.getPriority()));
            } catch (IllegalArgumentException e) {

            }
        }

        if (taskRequest.getAssignedUserId() != null) {
            User assignedUser = userRepository.findById(taskRequest.getAssignedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned User not found"));
            task.setAssignedUser(assignedUser);
        }

        task.setDueDate(taskRequest.getDueDate());
        task.setAttachments(taskRequest.getAttachments());

        Task updatedTask = taskRepository.save(task);
        return mapToResponse(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(Long userId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        taskRepository.delete(task);
    }

    @Override
    public TaskResponse getTaskById(Long userId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        return mapToResponse(task);
    }

    private TaskResponse mapToResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                task.getDueDate(),
                task.getAttachments(),
                task.getPriority(),
                task.getAssignedUser() != null ? task.getAssignedUser().getId() : null,
                task.getAssignedUser() != null ? task.getAssignedUser().getUsername() : null);
    }
}
