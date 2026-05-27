package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.ApiResult;
import com.shanghai.travelbackend.entity.Favorite;
import com.shanghai.travelbackend.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ApiResult<List<Favorite>> list(@RequestParam Long userId) {
        return ApiResult.ok(favoriteService.getUserFavorites(userId));
    }

    @PostMapping
    public ApiResult<Favorite> add(@RequestBody Map<String, Long> body) {
        Favorite fav = favoriteService.addFavorite(body.get("userId"), body.get("hotelId"));
        return ApiResult.ok(fav);
    }

    @DeleteMapping
    public ApiResult<Void> remove(@RequestParam Long userId, @RequestParam Long hotelId) {
        favoriteService.removeFavorite(userId, hotelId);
        return ApiResult.ok();
    }

    @GetMapping("/check")
    public ApiResult<Boolean> check(@RequestParam Long userId, @RequestParam Long hotelId) {
        return ApiResult.ok(favoriteService.isFavorite(userId, hotelId));
    }
}
