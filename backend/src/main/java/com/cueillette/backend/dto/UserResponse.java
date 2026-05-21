package com.cueillette.backend.dto;

import com.cueillette.backend.model.Role;
import com.cueillette.backend.model.User;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        Role role,
        String farmName,
        LocalDateTime subscriptionDate
) {
    public static UserResponse fromUser(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getFarmName(),
                user.getSubscriptionDate()
        );
    }
}
