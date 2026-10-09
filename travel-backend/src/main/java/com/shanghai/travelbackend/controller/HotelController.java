package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.ApiResult;
import com.shanghai.travelbackend.dto.HotelDetailResponse;
import com.shanghai.travelbackend.dto.HotelListItemResponse;
import com.shanghai.travelbackend.service.HotelService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@Validated
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
    public ApiResult<List<HotelListItemResponse>> getAll() {
        return ApiResult.ok(hotelService.getAllHotels());
    }

    @GetMapping("/recommended")
    public ApiResult<List<HotelListItemResponse>> getRecommended() {
        return ApiResult.ok(hotelService.getRecommendedHotels());
    }

    @GetMapping("/{id}")
    public ApiResult<HotelDetailResponse> getDetail(
            @PathVariable @Positive(message = "酒店编号必须为正整数") Long id) {
        return ApiResult.ok(hotelService.getHotelDetail(id));
    }

    @GetMapping("/search")
    public ApiResult<List<HotelListItemResponse>> search(
            @RequestParam(required = false) @Size(max = 100, message = "搜索关键词不能超过 100 个字符") String keyword,
            @RequestParam(required = false) @Size(max = 50, message = "区域名称不能超过 50 个字符") String area,
            @RequestParam(required = false) @Min(value = 1, message = "酒店星级不能低于 1")
                    @Max(value = 5, message = "酒店星级不能高于 5") Integer starLevel,
            @RequestParam(required = false)
                    @Pattern(regexp = "low-low|low|mid|high|luxury", message = "价格档位不正确") String priceLevel) {
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
