package com.cueillette.backend.service;

import com.cueillette.backend.model.Role;
import com.cueillette.backend.model.User;
import com.cueillette.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(String name, String email, String password, Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password); // plain text for now, we'll hash later
        user.setRole(role);
        user.setSubscriptionDate(LocalDateTime.now());

        return userRepository.save(user);
    }
}