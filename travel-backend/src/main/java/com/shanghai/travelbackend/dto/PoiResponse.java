package com.shanghai.travelbackend.dto;

import com.shanghai.travelbackend.entity.Poi;
import com.shanghai.travelbackend.entity.PoiType;

import java.math.BigDecimal;
import java.util.List;

public record PoiResponse(
        Long id,
        String name,
        PoiType type,
        String area,
        String address,
        BigDecimal latitude,
        BigDecimal longitude,
        String openingHours,
        BigDecimal ticketPrice,
        BigDecimal averagePrice,
        Integer suggestedDurationMinutes,
        String description,
        String imageUrl,
        BigDecimal rating,
        Boolean recommended,
        Boolean active,
        List<String> tags,
        Long version) {

    public static PoiResponse from(Poi poi) {
        return new PoiResponse(poi.getId(), poi.getName(), poi.getType(), poi.getArea(), poi.getAddress(),
                poi.getLatitude(), poi.getLongitude(), poi.getOpeningHours(), poi.getTicketPrice(),
                poi.getAveragePrice(), poi.getSuggestedDurationMinutes(), poi.getDescription(),
                poi.getImageUrl(), poi.getRating(), poi.getRecommended(), poi.getActive(),
                List.copyOf(poi.getTags()), poi.getVersion());
    }
}
