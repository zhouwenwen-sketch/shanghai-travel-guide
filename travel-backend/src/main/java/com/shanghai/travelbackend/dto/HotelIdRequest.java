package com.shanghai.travelbackend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record HotelIdRequest(
        @NotNull(message = "酒店编号不能为空")
        @Positive(message = "酒店编号必须为正整数")
        Long hotelId) {
}
