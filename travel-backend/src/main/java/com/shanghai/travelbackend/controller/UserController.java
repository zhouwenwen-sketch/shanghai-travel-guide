package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.ApiResult;
import com.shanghai.travelbackend.dto.LoginRequest;
import com.shanghai.travelbackend.dto.AuthResponse;
import com.shanghai.travelbackend.dto.UserSummary;
import com.shanghai.travelbackend.entity.User;
import com.shanghai.travelbackend.security.JwtTokenService;
import com.shanghai.travelbackend.security.AuthenticatedUserIdResolver;
import com.shanghai.travelbackend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtTokenService jwtTokenService;
    private final AuthenticatedUserIdResolver authenticatedUserIdResolver;

    @PostMapping("/register")
    public ApiResult<AuthResponse> register(@Valid @RequestBody LoginRequest req) {
        User user = userService.register(req.getUsername(), req.getPassword());
        return ApiResult.ok(jwtTokenService.issue(user));
    }

    @PostMapping("/login")
    public ApiResult<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        User user = userService.login(req.getUsername(), req.getPassword());
        return ApiResult.ok(jwtTokenService.issue(user));
    }

    @GetMapping("/me")
    public ApiResult<UserSummary> me(@AuthenticationPrincipal Jwt jwt) {
        return ApiResult.ok(UserSummary.from(
                userService.getById(authenticatedUserIdResolver.requireUserId(jwt))));
    }
}
