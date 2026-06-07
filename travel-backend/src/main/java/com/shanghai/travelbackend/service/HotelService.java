package com.shanghai.travelbackend.service;

import com.shanghai.travelbackend.entity.Hotel;
import java.util.List;

public interface HotelService {
    List<Hotel> getAllHotels();
    List<Hotel> getRecommendedHotels();
    Hotel getHotelDetail(Long id);
    List<Hotel> search(String keyword, String area, Integer starLevel, Integer minPrice, Integer maxPrice);
}
