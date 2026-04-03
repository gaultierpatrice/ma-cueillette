package com.cueillette.backend.controller;

import com.cueillette.backend.model.Role;
import com.cueillette.backend.model.User;
import com.cueillette.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // allows frontend to call the API
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

    public record RegisterRequest(String name, String email, String password, Role role) {}
}
