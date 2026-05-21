package com.cueillette.backend.dto;

import com.cueillette.backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 8, max = 128, message = "must contain at least 8 characters") String password,
        Role role,
        @Size(max = 200) String farmName
) {}
