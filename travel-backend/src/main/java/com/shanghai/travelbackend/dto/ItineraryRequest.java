package com.shanghai.travelbackend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record ItineraryRequest(@NotBlank @Size(max = 100) String title,
        @NotNull LocalDate startDate, @NotNull LocalDate endDate) {}
