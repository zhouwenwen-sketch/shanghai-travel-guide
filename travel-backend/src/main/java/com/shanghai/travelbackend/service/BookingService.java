package com.shanghai.travelbackend.service;

import com.shanghai.travelbackend.dto.BookingResponse;
import com.shanghai.travelbackend.dto.CreateBookingRequest;
import java.util.List;

public interface BookingService {
    BookingResponse create(Long userId, String idempotencyKey, CreateBookingRequest request);
    List<BookingResponse> list(Long userId);
    BookingResponse get(Long userId, Long bookingId);
    BookingResponse cancel(Long userId, Long bookingId, Long expectedVersion);
}
