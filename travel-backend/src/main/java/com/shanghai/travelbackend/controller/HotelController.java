package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.ApiResult;
import com.shanghai.travelbackend.entity.Hotel;
import com.shanghai.travelbackend.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

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
        return ApiResult.ok(hotelService.search(keyword, area, starLevel, priceLevel));
    }
}
