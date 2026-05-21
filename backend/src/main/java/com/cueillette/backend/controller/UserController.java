package com.cueillette.backend.controller;

import com.cueillette.backend.dto.UserResponse;
import com.cueillette.backend.model.Role;
import com.cueillette.backend.model.User;
import com.cueillette.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        User created = userService.createUser(
                request.name(),
                request.email(),
                request.password(),
                request.role() != null ? request.role() : Role.USER,
                request.farmName()
        );
        return ResponseEntity.ok(UserResponse.fromUser(created));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        String token = userService.login(request.email(), request.password());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, String>> deleteAccount(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        userService.deleteUserAccount(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    public record RegisterRequest(String name, String email, String password, Role role, String farmName) {}
    public record LoginRequest(String email, String password) {}
}
