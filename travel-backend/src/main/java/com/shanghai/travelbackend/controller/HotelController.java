package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.ApiResult;
import com.shanghai.travelbackend.entity.Hotel;
import com.shanghai.travelbackend.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private static final Map<String, int[]> PRICE_RANGES = Map.of(
        "low-low", new int[]{0, 150},
        "low", new int[]{150, 300},
        "mid", new int[]{300, 450},
        "high", new int[]{450, 600},
        "luxury", new int[]{600, Integer.MAX_VALUE}
    );

    private final HotelService hotelService;

    @GetMapping
    public ApiResult<List<Hotel>> getAll() {
        return ApiResult.ok(hotelService.getAllHotels());
    }

    @GetMapping("/recommended")
    public ApiResult<List<Hotel>> getRecommended() {
        return ApiResult.ok(hotelService.getRecommendedHotels());
    }

    @GetMapping("/{id}")
    public ApiResult<Hotel> getDetail(@PathVariable Long id) {
        return ApiResult.ok(hotelService.getHotelDetail(id));
    }

    @GetMapping("/search")
    public ApiResult<List<Hotel>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) Integer starLevel,
            @RequestParam(required = false) String priceLevel) {
        Integer minPrice = null;
        Integer maxPrice = null;
        if (priceLevel != null && !priceLevel.isBlank()) {
            int[] range = PRICE_RANGES.get(priceLevel);
            if (range != null) {
                minPrice = range[0];
                maxPrice = range[1] == Integer.MAX_VALUE ? null : range[1];
            }
        }
        return ApiResult.ok(hotelService.search(keyword, area, starLevel, minPrice, maxPrice));
    }
}
