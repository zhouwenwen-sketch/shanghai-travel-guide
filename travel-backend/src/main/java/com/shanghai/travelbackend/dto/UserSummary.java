package com.shanghai.travelbackend.dto;

import com.shanghai.travelbackend.entity.User;
import com.shanghai.travelbackend.entity.UserRole;

public record UserSummary(Long userId, String username, UserRole role) {
    public UserSummary(Long userId, String username) {
        this(userId, username, UserRole.USER);
    }

    public static UserSummary from(User user) {
        return new UserSummary(user.getId(), user.getUsername(), user.getRole());
    }
}
