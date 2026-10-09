package com.shanghai.travelbackend.service;

import com.shanghai.travelbackend.dto.HotelDetailResponse;
import com.shanghai.travelbackend.dto.HotelListItemResponse;

import java.util.List;

public interface HotelService {
    List<HotelListItemResponse> getAllHotels();
    List<HotelListItemResponse> getRecommendedHotels();
    HotelDetailResponse getHotelDetail(Long id);
    List<HotelListItemResponse> search(
            String keyword, String area, Integer starLevel, Integer minPrice, Integer maxPrice);
}
