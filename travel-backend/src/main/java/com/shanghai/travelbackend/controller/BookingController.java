package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.*;
import com.shanghai.travelbackend.http.VersionHeaderParser;
import com.shanghai.travelbackend.security.AuthenticatedUserIdResolver;
import com.shanghai.travelbackend.service.BookingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Validated @RestController @RequestMapping("/api/bookings") @RequiredArgsConstructor
public class BookingController {
    private final BookingService service;
    private final AuthenticatedUserIdResolver users;
    @PostMapping public ApiResult<BookingResponse> create(@AuthenticationPrincipal Jwt jwt,
            @RequestHeader("Idempotency-Key") @NotBlank @Size(max = 64)
            @Pattern(regexp = "^[A-Za-z0-9._:-]+$", message = "Idempotency-Key 格式不正确") String idempotencyKey,
            @Valid @RequestBody CreateBookingRequest request) {
        return ApiResult.ok(service.create(users.requireUserId(jwt), idempotencyKey, request));
    }
    @GetMapping public ApiResult<List<BookingResponse>> list(@AuthenticationPrincipal Jwt jwt) { return ApiResult.ok(service.list(users.requireUserId(jwt))); }
    @GetMapping("/{id}") public ApiResult<BookingResponse> get(@AuthenticationPrincipal Jwt jwt,
            @PathVariable @Positive Long id) { return ApiResult.ok(service.get(users.requireUserId(jwt), id)); }
    @PostMapping("/{id}/cancel") public ApiResult<BookingResponse> cancel(@AuthenticationPrincipal Jwt jwt,
            @PathVariable @Positive Long id,
            @RequestHeader("If-Match") String ifMatch) {
        return ApiResult.ok(service.cancel(users.requireUserId(jwt), id, VersionHeaderParser.parse(ifMatch)));
    }
}
