package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.ApiResult;
import com.shanghai.travelbackend.dto.BrowseHistoryResponse;
import com.shanghai.travelbackend.dto.HotelIdRequest;
import com.shanghai.travelbackend.entity.BrowseHistory;
import com.shanghai.travelbackend.security.AuthenticatedUserIdResolver;
import com.shanghai.travelbackend.service.BrowseHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class BrowseHistoryController {

    private final BrowseHistoryService browseHistoryService;
    private final AuthenticatedUserIdResolver authenticatedUserIdResolver;

    @GetMapping
    public ApiResult<List<BrowseHistoryResponse>> list(@AuthenticationPrincipal Jwt jwt) {
        List<BrowseHistoryResponse> history = browseHistoryService
                .getUserHistory(authenticatedUserIdResolver.requireUserId(jwt))
                .stream()
                .map(BrowseHistoryResponse::from)
                .toList();
        return ApiResult.ok(history);
    }

    @PostMapping
    public ApiResult<BrowseHistoryResponse> add(@AuthenticationPrincipal Jwt jwt,
                                                @Valid @RequestBody HotelIdRequest body) {
        BrowseHistory history = browseHistoryService.addHistory(
                authenticatedUserIdResolver.requireUserId(jwt), body.hotelId());
        return ApiResult.ok(BrowseHistoryResponse.from(history));
    }

    @DeleteMapping
    public ApiResult<Void> clear(@AuthenticationPrincipal Jwt jwt) {
        browseHistoryService.clearHistory(authenticatedUserIdResolver.requireUserId(jwt));
        return ApiResult.ok();
    }
}
