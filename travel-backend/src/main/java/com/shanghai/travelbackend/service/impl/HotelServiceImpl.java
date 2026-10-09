package com.shanghai.travelbackend.service.impl;

import com.shanghai.travelbackend.dto.HotelDetailResponse;
import com.shanghai.travelbackend.dto.HotelListItemResponse;
import com.shanghai.travelbackend.exception.BusinessException;
import com.shanghai.travelbackend.exception.ErrorCode;
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
    public List<HotelListItemResponse> getAllHotels() {
        return hotelRepository.findAll().stream()
                .map(HotelListItemResponse::from)
                .toList();
    }

    @Override
    public List<HotelListItemResponse> getRecommendedHotels() {
        return hotelRepository.findByRecommendedTrue().stream()
                .map(HotelListItemResponse::from)
                .toList();
    }

    @Override
    public HotelDetailResponse getHotelDetail(Long id) {
        return hotelRepository.findByIdWithDetails(id)
                .map(HotelDetailResponse::from)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "酒店不存在"));
    }

    @Override
    public List<HotelListItemResponse> search(
            String keyword, String area, Integer starLevel, Integer minPrice, Integer maxPrice) {
        String kw = (keyword != null && keyword.isBlank()) ? null : keyword;
        String ar = (area != null && area.isBlank()) ? null : area;
        return hotelRepository.search(kw, ar, starLevel, minPrice, maxPrice).stream()
                .map(HotelListItemResponse::from)
                .toList();
    }
}
