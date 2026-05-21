package com.cueillette.backend.service;



import com.cueillette.backend.exception.BadRequestException;

import com.cueillette.backend.exception.ConflictException;

import com.cueillette.backend.exception.InvalidCredentialsException;

import com.cueillette.backend.exception.NotFoundException;

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

            throw new BadRequestException("Admin accounts cannot be created through registration");

        }

        if (userRepository.existsByEmail(email)) {

            throw new ConflictException("Email already in use");

        }



        User user = new User();

        user.setName(name);

        user.setEmail(email);

        user.setPassword(passwordEncoder.encode(password));

        user.setRole(role);

        user.setSubscriptionDate(LocalDateTime.now());



        if (role == Role.PRODUCER && farmName != null && !farmName.trim().isEmpty()) {

            user.setFarmName(farmName);

        }



        return userRepository.save(user);

    }



    public String login(String email, String password) {

        Optional<User> userOpt = userRepository.findByEmail(email);



        if (userOpt.isEmpty()) {

            throw new InvalidCredentialsException();

        }



        User user = userOpt.get();



        if (!passwordEncoder.matches(password, user.getPassword())) {

            throw new InvalidCredentialsException();

        }



        return jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getName(), user.getFarmName());

    }



    public void deleteUserAccount(String email) {

        User user = userRepository.findByEmail(email)

                .orElseThrow(() -> new NotFoundException("User not found"));



        userRepository.delete(user);

    }

}

