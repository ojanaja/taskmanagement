package com.example.taskmanagement;

import com.example.taskmanagement.payload.LoginRequest;
import com.example.taskmanagement.payload.SignupRequest;
import com.example.taskmanagement.security.JwtUtils;
import com.example.taskmanagement.security.UserDetailsImpl;
import com.example.taskmanagement.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private AuthenticationManager authenticationManager;

        @MockBean
        private UserRepository userRepository;

        @MockBean
        private PasswordEncoder passwordEncoder;

        @MockBean
        private JwtUtils jwtUtils;

        @Test
        public void testLoginSuccess() throws Exception {
                LoginRequest loginRequest = new LoginRequest();
                loginRequest.setUsername("testuser");
                loginRequest.setPassword("password");

                Authentication authentication = new UsernamePasswordAuthenticationToken(
                                new UserDetailsImpl(1L, "testuser", "password",
                                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))),
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

                when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                                .thenReturn(authentication);
                when(jwtUtils.generateJwtToken(any(Authentication.class))).thenReturn("fake-jwt-token");

                mockMvc.perform(post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.accessToken").value("fake-jwt-token"))
                                .andExpect(jsonPath("$.username").value("testuser"));
        }

        @Test
        public void testRegisterSuccess() throws Exception {
                SignupRequest signupRequest = new SignupRequest();
                signupRequest.setUsername("newuser");
                signupRequest.setPassword("password");
                signupRequest.setRole("ROLE_USER");

                when(userRepository.existsByUsername("newuser")).thenReturn(false);
                when(passwordEncoder.encode("password")).thenReturn("encodedPassword");

                mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(signupRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("User registered successfully!"));
        }

        @Test
        public void testRegisterDuplicateUsername() throws Exception {
                SignupRequest signupRequest = new SignupRequest();
                signupRequest.setUsername("existinguser");
                signupRequest.setPassword("password");

                when(userRepository.existsByUsername("existinguser")).thenReturn(true);

                mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(signupRequest)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message").value("Error: Username is already taken!"));
        }
}
