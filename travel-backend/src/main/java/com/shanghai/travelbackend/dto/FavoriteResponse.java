package com.shanghai.travelbackend.dto;

import com.shanghai.travelbackend.entity.Favorite;

import java.time.LocalDateTime;

public record FavoriteResponse(
        Long id,
        Long hotelId,
        HotelSummary hotel,
        LocalDateTime createdAt
) {
    public static FavoriteResponse from(Favorite favorite) {
        return new FavoriteResponse(
                favorite.getId(),
                favorite.getHotel().getId(),
                HotelSummary.from(favorite.getHotel()),
                favorite.getCreatedAt()
        );
    }
}
