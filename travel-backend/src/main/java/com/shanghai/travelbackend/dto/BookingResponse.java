package com.shanghai.travelbackend.dto;

import com.shanghai.travelbackend.entity.Booking;
import com.shanghai.travelbackend.entity.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BookingResponse(Long id, Long version, Long hotelId, String hotelName, String hotelImage,
        LocalDate checkIn, LocalDate checkOut, Integer guestCount,
        String contactName, String contactPhone, BigDecimal nightlyPrice,
        BigDecimal totalPrice, BookingStatus status, LocalDateTime createdAt,
        LocalDateTime cancelledAt) {
    public static BookingResponse from(Booking b) {
        return new BookingResponse(b.getId(), b.getVersion(), b.getHotel().getId(), b.getHotel().getName(),
                b.getHotel().getImgUrl(), b.getCheckIn(), b.getCheckOut(), b.getGuestCount(),
                b.getContactName(), b.getContactPhone(), b.getNightlyPrice(), b.getTotalPrice(),
                b.getStatus(), b.getCreatedAt(), b.getCancelledAt());
    }
}
