package com.shanghai.travelbackend.service.impl;

import com.shanghai.travelbackend.dto.*;
import com.shanghai.travelbackend.entity.*;
import com.shanghai.travelbackend.exception.*;
import com.shanghai.travelbackend.repository.*;
import com.shanghai.travelbackend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class BookingServiceImpl implements BookingService {
    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    @Override @Transactional
    public BookingResponse create(Long userId, String idempotencyKey, CreateBookingRequest request) {
        String normalizedKey = idempotencyKey.trim();
        LocalDate today = LocalDate.now(clock);
        if (!request.checkIn().isAfter(today)) {
            throw invalid("入住日期必须晚于今天");
        }
        if (!request.checkOut().isAfter(request.checkIn())) {
            throw invalid("离店日期必须晚于入住日期");
        }
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        Booking existing = bookingRepository.findByUserIdAndIdempotencyKey(userId, normalizedKey).orElse(null);
        if (existing != null) return replayOrConflict(existing, request);
        Hotel hotel = hotelRepository.findById(request.hotelId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "酒店不存在"));
        if (hotel.getPrice() == null || hotel.getPrice() <= 0) {
            throw new BusinessException(ErrorCode.INVALID_STATE, "酒店价格暂不可用");
        }
        long nights = ChronoUnit.DAYS.between(request.checkIn(), request.checkOut());
        BigDecimal nightlyPrice = BigDecimal.valueOf(hotel.getPrice());
        Booking booking = new Booking();
        booking.setUser(user); booking.setHotel(hotel);
        booking.setCheckIn(request.checkIn()); booking.setCheckOut(request.checkOut());
        booking.setGuestCount(request.guestCount());
        booking.setContactName(request.contactName().trim());
        booking.setContactPhone(request.contactPhone().trim());
        booking.setNightlyPrice(nightlyPrice);
        booking.setTotalPrice(nightlyPrice.multiply(BigDecimal.valueOf(nights)));
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setCreatedAt(LocalDateTime.now(clock));
        booking.setIdempotencyKey(normalizedKey);
        return BookingResponse.from(bookingRepository.saveAndFlush(booking));
    }

    @Override public List<BookingResponse> list(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(BookingResponse::from).toList();
    }
    @Override public BookingResponse get(Long userId, Long bookingId) { return BookingResponse.from(requireOwned(userId, bookingId)); }
    @Override @Transactional public BookingResponse cancel(Long userId, Long bookingId, Long expectedVersion) {
        Booking booking = requireOwned(userId, bookingId);
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return BookingResponse.from(booking);
        }
        if (!booking.getVersion().equals(expectedVersion)) {
            throw new BusinessException(ErrorCode.INVALID_STATE, "预订记录已被更新，请刷新后重试");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now(clock));
        return BookingResponse.from(bookingRepository.saveAndFlush(booking));
    }
    private BookingResponse replayOrConflict(Booking booking, CreateBookingRequest request) {
        boolean sameRequest = booking.getHotel().getId().equals(request.hotelId())
                && booking.getCheckIn().equals(request.checkIn())
                && booking.getCheckOut().equals(request.checkOut())
                && booking.getGuestCount().equals(request.guestCount())
                && booking.getContactName().equals(request.contactName().trim())
                && booking.getContactPhone().equals(request.contactPhone().trim());
        if (!sameRequest) {
            throw new BusinessException(ErrorCode.INVALID_STATE, "同一 Idempotency-Key 不能用于不同的预订请求");
        }
        return BookingResponse.from(booking);
    }
    private Booking requireOwned(Long userId, Long id) {
        return bookingRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "预订记录不存在"));
    }
    private BusinessException invalid(String message) { return new BusinessException(ErrorCode.INVALID_REQUEST, message); }
}
