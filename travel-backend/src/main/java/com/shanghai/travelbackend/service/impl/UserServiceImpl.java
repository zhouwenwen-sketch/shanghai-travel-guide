package com.shanghai.travelbackend.service.impl;

import com.shanghai.travelbackend.entity.User;
import com.shanghai.travelbackend.entity.UserRole;
import com.shanghai.travelbackend.exception.BusinessException;
import com.shanghai.travelbackend.exception.ErrorCode;
import com.shanghai.travelbackend.repository.UserRepository;
import com.shanghai.travelbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private static final String DUMMY_PASSWORD_HASH =
            "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User register(String username, String password) {
        String normalizedUsername = username.trim();
        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "用户名已存在");
        }
        User user = new User();
        user.setUsername(normalizedUsername);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(UserRole.USER);
        User savedUser = userRepository.save(user);
        log.info("event=user_registered userId={}", savedUser.getId());
        return savedUser;
    }

    @Override
    public User login(String username, String password) {
        Optional<User> foundUser = userRepository.findByUsername(username.trim());
        if (foundUser.isEmpty()) {
            passwordEncoder.matches(password, DUMMY_PASSWORD_HASH);
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        User user = foundUser.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        log.info("event=user_login_succeeded userId={}", user.getId());
        return user;
    }

    @Override
    public User getById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "用户不存在"));
    }
}
