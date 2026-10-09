package com.shanghai.travelbackend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record CreateBookingRequest(
        @NotNull @Positive Long hotelId,
        @NotNull LocalDate checkIn,
        @NotNull LocalDate checkOut,
        @NotNull @Min(1) @Max(10) Integer guestCount,
        @NotBlank @Size(max = 80) String contactName,
        @NotBlank @Pattern(regexp = "^[0-9+() -]{6,30}$", message = "联系电话格式不正确") String contactPhone
) {}
