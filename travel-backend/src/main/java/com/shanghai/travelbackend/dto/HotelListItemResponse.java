package com.shanghai.travelbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.shanghai.travelbackend.entity.Hotel;

import java.util.List;

public record HotelListItemResponse(
        Long id,
        String name,
        Boolean recommended,
        Integer starLevel,
        @JsonProperty("img_url") String imgUrl,
        @JsonProperty("banner_url") String bannerUrl,
        @JsonProperty("starimg_url") String starimgUrl,
        String transport,
        String phone,
        String area,
        String priceLevel,
        Integer price,
        String description,
        @JsonProperty("tag") List<String> tags,
        Double rating,
        Integer reviewCount,
        String reviewDesc
) {
    public static HotelListItemResponse from(Hotel hotel) {
        return new HotelListItemResponse(
                hotel.getId(),
                hotel.getName(),
                hotel.getRecommended(),
                hotel.getStarLevel(),
                hotel.getImgUrl(),
                hotel.getBannerUrl(),
                hotel.getStarimgUrl(),
                hotel.getTransport(),
                hotel.getPhone(),
                hotel.getArea(),
                hotel.getPriceLevel(),
                hotel.getPrice(),
                hotel.getDescription(),
                hotel.getTags() == null ? List.of() : List.copyOf(hotel.getTags()),
                hotel.getRating(),
                hotel.getReviewCount(),
                hotel.getReviewDesc()
        );
    }
}
