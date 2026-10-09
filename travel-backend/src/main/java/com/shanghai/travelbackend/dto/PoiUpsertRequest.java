package com.shanghai.travelbackend.dto;

import com.shanghai.travelbackend.entity.PoiType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record PoiUpsertRequest(
        @NotBlank @Size(max = 120) String name,
        @NotNull PoiType type,
        @NotBlank @Size(max = 50) String area,
        @NotBlank @Size(max = 200) String address,
        @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") BigDecimal latitude,
        @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") BigDecimal longitude,
        @Size(max = 200) String openingHours,
        @PositiveOrZero @Digits(integer = 8, fraction = 2) BigDecimal ticketPrice,
        @PositiveOrZero @Digits(integer = 8, fraction = 2) BigDecimal averagePrice,
        @Min(1) @Max(1440) Integer suggestedDurationMinutes,
        @Size(max = 5000) String description,
        @Size(max = 500) String imageUrl,
        @DecimalMin("0.0") @DecimalMax("5.0") @Digits(integer = 1, fraction = 1) BigDecimal rating,
        @NotNull Boolean recommended,
        @NotNull Boolean active,
        @Size(max = 10) List<@NotBlank @Size(max = 50) String> tags,
        @PositiveOrZero Long version) {
}
