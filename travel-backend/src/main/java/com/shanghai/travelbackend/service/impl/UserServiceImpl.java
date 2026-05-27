package com.shanghai.travelbackend.service.impl;

import com.shanghai.travelbackend.entity.User;
import com.shanghai.travelbackend.repository.UserRepository;
import com.shanghai.travelbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User register(String username, String password) {
        if (username == null || username.trim().isEmpty()) {
            throw new RuntimeException("用户名不能为空");
        }
        if (password == null || password.isEmpty()) {
            throw new RuntimeException("密码不能为空");
        }
        if (userRepository.existsByUsername(username.trim())) {
            throw new RuntimeException("用户名已存在");
        }
        User user = new User();
        user.setUsername(username.trim());
        user.setPassword(password);
        return userRepository.save(user);
    }

    @Override
    public User login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户名不存在"));
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("密码错误");
        }
        return user;
    }
}
