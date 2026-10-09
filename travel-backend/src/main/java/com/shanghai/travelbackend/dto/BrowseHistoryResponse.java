package com.shanghai.travelbackend.dto;

import com.shanghai.travelbackend.entity.BrowseHistory;

public record BrowseHistoryResponse(
        Long id,
        Long hotelId,
        HotelSummary hotel,
        Long visitedAt
) {
    public static BrowseHistoryResponse from(BrowseHistory history) {
        return new BrowseHistoryResponse(
                history.getId(),
                history.getHotel().getId(),
                HotelSummary.from(history.getHotel()),
                history.getTimestamp()
        );
    }
}
