package com.shanghai.travelbackend.dto;

import com.shanghai.travelbackend.entity.Itinerary;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ItineraryResponse(Long id, Long version, String title, LocalDate startDate, LocalDate endDate,
        LocalDateTime createdAt, LocalDateTime updatedAt, List<ItineraryItemResponse> items) {
    public static ItineraryResponse summary(Itinerary i) {
        return new ItineraryResponse(i.getId(), i.getVersion(), i.getTitle(), i.getStartDate(), i.getEndDate(),
                i.getCreatedAt(), i.getUpdatedAt(), List.of());
    }
    public static ItineraryResponse detail(Itinerary i) {
        return new ItineraryResponse(i.getId(), i.getVersion(), i.getTitle(), i.getStartDate(), i.getEndDate(),
                i.getCreatedAt(), i.getUpdatedAt(), i.getItems().stream().map(ItineraryItemResponse::from).toList());
    }
}
