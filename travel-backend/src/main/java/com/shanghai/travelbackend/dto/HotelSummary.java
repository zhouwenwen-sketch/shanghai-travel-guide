package com.shanghai.travelbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.shanghai.travelbackend.entity.Hotel;

import java.util.List;

public record HotelSummary(
        Long id,
        String name,
        @JsonProperty("img_url") String imgUrl,
        String transport,
        Integer price,
        Double rating,
        @JsonProperty("tag") List<String> tags
) {
    public static HotelSummary from(Hotel hotel) {
        return new HotelSummary(
                hotel.getId(),
                hotel.getName(),
                hotel.getImgUrl(),
                hotel.getTransport(),
                hotel.getPrice(),
                hotel.getRating(),
                hotel.getTags() == null ? List.of() : List.copyOf(hotel.getTags())
        );
    }
}
