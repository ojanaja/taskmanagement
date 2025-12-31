package com.example.taskmanagement.security;

import com.example.taskmanagement.entity.User;
import com.example.taskmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("UserDetailsServiceImpl: Loading user " + username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    System.out.println("UserDetailsServiceImpl: User not found " + username);
                    return new UsernameNotFoundException("User Not Found with username: " + username);
                });
        System.out.println("UserDetailsServiceImpl: User found, role: " + user.getRole());
        return UserDetailsImpl.build(user);
    }
}
