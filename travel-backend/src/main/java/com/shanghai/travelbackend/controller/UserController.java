package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.ApiResult;
import com.shanghai.travelbackend.dto.LoginRequest;
import com.shanghai.travelbackend.entity.User;
import com.shanghai.travelbackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ApiResult<Map<String, Object>> register(@RequestBody LoginRequest req) {
        User user = userService.register(req.getUsername(), req.getPassword());
        return ApiResult.ok(Map.of(
            "userId", user.getId(),
            "username", user.getUsername()
        ));
    }

    @PostMapping("/login")
    public ApiResult<Map<String, Object>> login(@RequestBody LoginRequest req) {
        User user = userService.login(req.getUsername(), req.getPassword());
        return ApiResult.ok(Map.of(
            "userId", user.getId(),
            "username", user.getUsername()
        ));
    }
}
