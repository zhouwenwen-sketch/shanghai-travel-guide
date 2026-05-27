package com.shanghai.travelbackend.service.impl;

import com.shanghai.travelbackend.entity.Hotel;
import com.shanghai.travelbackend.repository.HotelRepository;
import com.shanghai.travelbackend.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HotelServiceImpl implements HotelService {

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
    public List<Hotel> search(String keyword, String area, Integer starLevel, String priceLevel) {
        // 空字符串视为 null
        String kw = (keyword != null && keyword.isBlank()) ? null : keyword;
        String ar = (area != null && area.isBlank()) ? null : area;
        String pl = (priceLevel != null && priceLevel.isBlank()) ? null : priceLevel;
        return hotelRepository.search(kw, ar, starLevel, pl);
    }
}
