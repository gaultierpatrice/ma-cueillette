package com.cueillette.backend.controller;

import com.cueillette.backend.model.Role;
import com.cueillette.backend.model.User;
import com.cueillette.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        User created = userService.createUser(
                request.name(),
                request.email(),
                request.password(),
                request.role() != null ? request.role() : Role.USER
        );
        return ResponseEntity.ok(created);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        String token = userService.login(request.email(), request.password());
        return ResponseEntity.ok(Map.of("token", token));
    }

    public record RegisterRequest(String name, String email, String password, Role role) {}
    public record LoginRequest(String email, String password) {}
}
