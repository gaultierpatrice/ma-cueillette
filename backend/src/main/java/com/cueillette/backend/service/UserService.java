package com.cueillette.backend.service;

import com.cueillette.backend.model.Role;
import com.cueillette.backend.model.User;
import com.cueillette.backend.repository.UserRepository;
import com.cueillette.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public User createUser(String name, String email, String password, Role role, String farmName) {
        if (role == Role.ADMIN) {
            throw new RuntimeException("Admin accounts cannot be created through registration");
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setSubscriptionDate(LocalDateTime.now());
        
        System.out.println("DEBUG - Creating user:");
        System.out.println("  Role: " + role);
        System.out.println("  FarmName received: " + farmName);
        
        if (role == Role.PRODUCER && farmName != null && !farmName.trim().isEmpty()) {
            user.setFarmName(farmName);
            System.out.println("  FarmName SET on user: " + farmName);
        } else {
            System.out.println("  FarmName NOT set. Conditions: role=" + role + ", farmName=" + farmName);
        }

        User saved = userRepository.save(user);
        System.out.println("DEBUG - User saved with farmName: " + saved.getFarmName());
        return saved;
    }

    public String login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getName(), user.getFarmName());
    }

    public void deleteUserAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        userRepository.delete(user);
    }
}