package com.shanghai.travelbackend.service.impl;

import com.shanghai.travelbackend.entity.Hotel;
import com.shanghai.travelbackend.repository.HotelRepository;
import com.shanghai.travelbackend.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.AbstractMap.SimpleEntry;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HotelServiceImpl implements HotelService {

    private static final Map<String, SimpleEntry<Integer, Integer>> PRICE_RANGES = Map.of(
        "low-low", new SimpleEntry<>(0, 150),
        "low", new SimpleEntry<>(150, 300),
        "mid", new SimpleEntry<>(300, 450),
        "high", new SimpleEntry<>(450, 600),
        "luxury", new SimpleEntry<>(600, Integer.MAX_VALUE)
    );

    private final HotelRepository hotelRepository;

    @Override
    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    @Override
    public List<Hotel> getRecommendedHotels() {
        return hotelRepository.findByRecommendedTrue();
    }

    @Override
    public Hotel getHotelDetail(Long id) {
        return hotelRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("酒店不存在"));
    }

    @Override
    public List<Hotel> search(String keyword, String area, Integer starLevel, Integer minPrice, Integer maxPrice) {
        String kw = (keyword != null && keyword.isBlank()) ? null : keyword;
        String ar = (area != null && area.isBlank()) ? null : area;
        return hotelRepository.search(kw, ar, starLevel, minPrice, maxPrice);
    }
}
