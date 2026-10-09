package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.ApiResult;
import com.shanghai.travelbackend.dto.FavoriteResponse;
import com.shanghai.travelbackend.dto.HotelIdRequest;
import com.shanghai.travelbackend.entity.Favorite;
import com.shanghai.travelbackend.security.AuthenticatedUserIdResolver;
import com.shanghai.travelbackend.service.FavoriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final AuthenticatedUserIdResolver authenticatedUserIdResolver;

    @GetMapping
    public ApiResult<List<FavoriteResponse>> list(@AuthenticationPrincipal Jwt jwt) {
        List<FavoriteResponse> favorites = favoriteService
                .getUserFavorites(authenticatedUserIdResolver.requireUserId(jwt))
                .stream()
                .map(FavoriteResponse::from)
                .toList();
        return ApiResult.ok(favorites);
    }

    @PostMapping
    public ApiResult<FavoriteResponse> add(@AuthenticationPrincipal Jwt jwt,
                                           @Valid @RequestBody HotelIdRequest body) {
        Favorite favorite = favoriteService.addFavorite(
                authenticatedUserIdResolver.requireUserId(jwt), body.hotelId());
        return ApiResult.ok(FavoriteResponse.from(favorite));
    }

    @DeleteMapping
    public ApiResult<Void> remove(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam @jakarta.validation.constraints.Positive(message = "酒店编号必须为正整数") Long hotelId) {
        favoriteService.removeFavorite(authenticatedUserIdResolver.requireUserId(jwt), hotelId);
        return ApiResult.ok();
    }

    @GetMapping("/check")
    public ApiResult<Boolean> check(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam @jakarta.validation.constraints.Positive(message = "酒店编号必须为正整数") Long hotelId) {
        return ApiResult.ok(favoriteService.isFavorite(
                authenticatedUserIdResolver.requireUserId(jwt), hotelId));
    }
}
