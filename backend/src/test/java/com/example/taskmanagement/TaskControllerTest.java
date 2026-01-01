package com.example.taskmanagement;

import com.example.taskmanagement.payload.task.TaskRequest;
import com.example.taskmanagement.payload.task.TaskResponse;
import com.example.taskmanagement.security.JwtUtils;
import com.example.taskmanagement.security.UserDetailsImpl;
import com.example.taskmanagement.service.TaskService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class TaskControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private TaskService taskService;

        @MockBean
        private JwtUtils jwtUtils;

        @Test
        public void testCreateTask() throws Exception {
                TaskRequest request = new TaskRequest();
                request.setTitle("New Task");
                request.setDescription("Description");

                TaskResponse response = new TaskResponse(1L, "New Task", "Description", null, null, null, null, null,
                                null);

                when(taskService.createTask(any(Long.class), any(TaskRequest.class))).thenReturn(response);

                UserDetailsImpl userDetails = new UserDetailsImpl(1L, "testuser", "password",
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

                mockMvc.perform(post("/tasks")
                                .with(user(userDetails))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.title").value("New Task"));
        }

        @Test
        public void testGetAllTasks() throws Exception {
                TaskResponse response = new TaskResponse(1L, "Task 1", "Desc", null, null, null, null, null, null);
                when(taskService.getAllTasks(any(Long.class))).thenReturn(Collections.singletonList(response));

                UserDetailsImpl userDetails = new UserDetailsImpl(1L, "testuser", "password",
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

                mockMvc.perform(get("/tasks")
                                .with(user(userDetails)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].title").value("Task 1"));
        }
}
