package com.shanghai.travelbackend.dto;

import com.shanghai.travelbackend.entity.ItineraryItemType;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

public record ItineraryItemRequest(@NotNull LocalDate itemDate,
        @NotNull ItineraryItemType type,
        LocalTime startTime, LocalTime endTime,
        @NotBlank @Size(max = 120) String title,
        @Size(max = 200) String location, @Size(max = 2000) String notes,
        @NotNull @Min(0) @Max(10000) Integer sortOrder,
        @Positive Long hotelId,
        @Positive Long poiId) {
    public ItineraryItemRequest(LocalDate itemDate, ItineraryItemType type,
                                LocalTime startTime, LocalTime endTime, String title,
                                String location, String notes, Integer sortOrder, Long hotelId) {
        this(itemDate, type, startTime, endTime, title, location, notes, sortOrder, hotelId, null);
    }
}
