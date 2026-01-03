package com.example.taskmanagement.controller;

import com.example.taskmanagement.payload.task.TaskRequest;
import com.example.taskmanagement.payload.task.TaskResponse;
import com.example.taskmanagement.security.UserDetailsImpl;
import com.example.taskmanagement.service.TaskService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getAllTasks(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<TaskResponse> tasks = taskService.getAllTasks(userDetails.getId());
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        TaskResponse task = taskService.getTaskById(userDetails.getId(), id);
        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody TaskRequest taskRequest) {
        TaskResponse createdTask = taskService.createTask(userDetails.getId(), taskRequest);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdTask.getId())
                .toUri();

        return ResponseEntity.created(location).body(createdTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id, @Valid @RequestBody TaskRequest taskRequest) {
        logger.info("Received Update Request for ID: {}", id);
        logger.info("Payload Title: {}", taskRequest.getTitle());
        logger.info("Payload Attachments: {}", taskRequest.getAttachments());
        TaskResponse updatedTask = taskService.updateTask(userDetails.getId(), id, taskRequest);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        taskService.deleteTask(userDetails.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
