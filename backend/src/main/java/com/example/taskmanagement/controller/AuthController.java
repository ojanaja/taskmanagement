package com.example.taskmanagement.controller;

import com.example.taskmanagement.payload.*;
import com.example.taskmanagement.security.JwtUtils;
import com.example.taskmanagement.security.UserDetailsImpl;
import com.example.taskmanagement.entity.User;
import com.example.taskmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {
        @Autowired
        AuthenticationManager authenticationManager;

        @Autowired
        UserRepository userRepository;

        @Autowired
        PasswordEncoder encoder;

        @Autowired
        JwtUtils jwtUtils;

        @PostMapping("/login")
        public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
                try {
                        System.out.println("Login Request received for: " + loginRequest.getUsername());
                        Authentication authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                        loginRequest.getPassword()));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        String jwt = jwtUtils.generateJwtToken(authentication);

                        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                        List<String> roles = userDetails.getAuthorities().stream()
                                        .map(item -> item.getAuthority())
                                        .collect(Collectors.toList());

                        return ResponseEntity.ok(new JwtResponse(jwt,
                                        userDetails.getId(),
                                        userDetails.getUsername(),
                                        roles));
                } catch (org.springframework.security.authentication.BadCredentialsException e) {
                        System.out.println("BadCredentialsException: " + e.getMessage());
                        return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                                        .body(new MessageResponse("Error: Bad credentials"));
                } catch (Exception e) {
                        e.printStackTrace();
                        return ResponseEntity.internalServerError()
                                        .body(new MessageResponse("Error: " + e.getMessage()));
                }
        }

        @PostMapping("/register")
        public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
                try {
                        System.out.println("Register Request received for: " + signUpRequest.getUsername());
                        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                                return ResponseEntity
                                                .badRequest()
                                                .body(new MessageResponse("Error: Username is already taken!"));
                        }

                        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                                return ResponseEntity
                                                .badRequest()
                                                .body(new MessageResponse("Error: Email is already in use!"));
                        }

                        User user = new User(signUpRequest.getUsername(),
                                        signUpRequest.getEmail(),
                                        encoder.encode(signUpRequest.getPassword()),
                                        signUpRequest.getRole() != null ? signUpRequest.getRole() : "ROLE_USER");

                        userRepository.save(user);

                        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
                } catch (Exception e) {
                        e.printStackTrace();
                        return ResponseEntity.internalServerError()
                                        .body(new MessageResponse("Error: " + e.getMessage()));
                }
        }
}
