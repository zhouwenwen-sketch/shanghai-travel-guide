package com.shanghai.travelbackend.dto;

import com.shanghai.travelbackend.entity.ItineraryItem;
import com.shanghai.travelbackend.entity.ItineraryItemType;
import java.time.LocalDate;
import java.time.LocalTime;

public record ItineraryItemResponse(Long id, LocalDate itemDate, Integer dayNumber,
        ItineraryItemType type, LocalTime startTime, LocalTime endTime, String title,
        String location, String notes, Integer sortOrder, Long hotelId, String hotelName,
        Long poiId, String poiName, Boolean poiActive) {
    public static ItineraryItemResponse from(ItineraryItem item) {
        return new ItineraryItemResponse(item.getId(), item.getItemDate(), item.getDayNumber(),
                item.getType(), item.getStartTime(), item.getEndTime(), item.getTitle(),
                item.getLocation(), item.getNotes(), item.getSortOrder(),
                item.getHotel() == null ? null : item.getHotel().getId(),
                item.getHotel() == null ? null : item.getHotel().getName(),
                item.getPoi() == null ? null : item.getPoi().getId(),
                item.getPoi() == null ? null : item.getPoi().getName(),
                item.getPoi() == null ? null : item.getPoi().getActive());
    }
}
