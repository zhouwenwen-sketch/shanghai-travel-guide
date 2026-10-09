package com.shanghai.travelbackend.service;

import com.shanghai.travelbackend.dto.BookingResponse;
import com.shanghai.travelbackend.dto.CreateBookingRequest;
import com.shanghai.travelbackend.entity.Booking;
import com.shanghai.travelbackend.entity.BookingStatus;
import com.shanghai.travelbackend.entity.Hotel;
import com.shanghai.travelbackend.entity.User;
import com.shanghai.travelbackend.exception.BusinessException;
import com.shanghai.travelbackend.repository.BookingRepository;
import com.shanghai.travelbackend.repository.HotelRepository;
import com.shanghai.travelbackend.repository.UserRepository;
import com.shanghai.travelbackend.service.impl.BookingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {
    @Mock private BookingRepository bookings;
    @Mock private HotelRepository hotels;
    @Mock private UserRepository users;
    private BookingServiceImpl service;

    private final Clock clock = Clock.fixed(Instant.parse("2026-09-01T10:15:30Z"), ZoneOffset.UTC);
    private User user;
    private Hotel hotel;

    @BeforeEach
    void setUp() {
        service = new BookingServiceImpl(bookings, hotels, users, clock);
        user = new User();
        user.setId(1L);
        hotel = new Hotel();
        hotel.setId(2L);
        hotel.setName("和平饭店");
        hotel.setPrice(1200);
    }

    @Test
    void createsBookingUsingTheInjectedClockAndNormalizedIdempotencyKey() {
        CreateBookingRequest request = request(2L, LocalDate.of(2026, 9, 2), LocalDate.of(2026, 9, 5));
        when(users.findByIdForUpdate(1L)).thenReturn(Optional.of(user));
        when(hotels.findById(2L)).thenReturn(Optional.of(hotel));
        when(bookings.saveAndFlush(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId(7L);
            booking.setVersion(0L);
            return booking;
        });

        BookingResponse result = service.create(1L, "  booking-1  ", request);

        ArgumentCaptor<Booking> captor = ArgumentCaptor.forClass(Booking.class);
        verify(bookings).saveAndFlush(captor.capture());
        Booking saved = captor.getValue();
        assertThat(saved.getIdempotencyKey()).isEqualTo("booking-1");
        assertThat(saved.getCreatedAt()).isEqualTo(LocalDateTime.of(2026, 9, 1, 10, 15, 30));
        assertThat(saved.getTotalPrice()).isEqualByComparingTo(BigDecimal.valueOf(3600));
        assertThat(result.id()).isEqualTo(7L);
        InOrder order = inOrder(users, bookings);
        order.verify(users).findByIdForUpdate(1L);
        order.verify(bookings).findByUserIdAndIdempotencyKey(1L, "booking-1");
    }

    @Test
    void replaysAnIdenticalIdempotentRequestWithoutCreatingAnotherBooking() {
        Booking existing = existingBooking();
        when(users.findByIdForUpdate(1L)).thenReturn(Optional.of(user));
        when(bookings.findByUserIdAndIdempotencyKey(1L, "repeat-1")).thenReturn(Optional.of(existing));

        BookingResponse result = service.create(1L, "repeat-1", request(2L, LocalDate.of(2026, 9, 2), LocalDate.of(2026, 9, 4)));

        assertThat(result.id()).isEqualTo(9L);
        InOrder order = inOrder(users, bookings);
        order.verify(users).findByIdForUpdate(1L);
        order.verify(bookings).findByUserIdAndIdempotencyKey(1L, "repeat-1");
        verify(bookings, never()).saveAndFlush(any());
    }

    @Test
    void rejectsAChangedRequestReusingTheSameIdempotencyKey() {
        when(users.findByIdForUpdate(1L)).thenReturn(Optional.of(user));
        when(bookings.findByUserIdAndIdempotencyKey(1L, "repeat-1")).thenReturn(Optional.of(existingBooking()));

        assertThatThrownBy(() -> service.create(1L, "repeat-1",
                request(2L, LocalDate.of(2026, 9, 3), LocalDate.of(2026, 9, 4))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Idempotency-Key");
    }

    @Test
    void cancelsOnlyWhenTheIfMatchVersionIsCurrent() {
        Booking current = existingBooking();
        when(bookings.findByIdAndUserId(9L, 1L)).thenReturn(Optional.of(current));
        when(bookings.saveAndFlush(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        BookingResponse result = service.cancel(1L, 9L, 4L);

        assertThat(result.status()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(current.getCancelledAt()).isEqualTo(LocalDateTime.of(2026, 9, 1, 10, 15, 30));

        Booking stale = existingBooking();
        when(bookings.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(stale));
        assertThatThrownBy(() -> service.cancel(1L, 10L, 3L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("刷新后重试");
    }

    private CreateBookingRequest request(Long hotelId, LocalDate checkIn, LocalDate checkOut) {
        return new CreateBookingRequest(hotelId, checkIn, checkOut, 2, " 小雯 ", " 13800138000 ");
    }

    private Booking existingBooking() {
        Booking booking = new Booking();
        booking.setId(9L);
        booking.setVersion(4L);
        booking.setUser(user);
        booking.setHotel(hotel);
        booking.setCheckIn(LocalDate.of(2026, 9, 2));
        booking.setCheckOut(LocalDate.of(2026, 9, 4));
        booking.setGuestCount(2);
        booking.setContactName("小雯");
        booking.setContactPhone("13800138000");
        booking.setNightlyPrice(BigDecimal.valueOf(1200));
        booking.setTotalPrice(BigDecimal.valueOf(2400));
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setCreatedAt(LocalDateTime.of(2026, 9, 1, 9, 0));
        return booking;
    }
}
