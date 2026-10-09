package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.ItineraryItemRequest;
import com.shanghai.travelbackend.dto.ItineraryRequest;
import com.shanghai.travelbackend.entity.ItineraryItemType;
import com.shanghai.travelbackend.exception.BusinessException;
import com.shanghai.travelbackend.security.AuthenticatedUserIdResolver;
import com.shanghai.travelbackend.service.BookingService;
import com.shanghai.travelbackend.service.ItineraryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class VersionHeaderControllerTest {
    private final BookingService bookings = mock(BookingService.class);
    private final ItineraryService itineraries = mock(ItineraryService.class);
    private final AuthenticatedUserIdResolver users = mock(AuthenticatedUserIdResolver.class);
    private final Jwt jwt = mock(Jwt.class);

    @BeforeEach
    void setUp() {
        when(users.requireUserId(jwt)).thenReturn(1L);
    }

    @Test
    void bookingCancelForwardsQuotedVersion() {
        new BookingController(bookings, users).cancel(jwt, 9L, "\"4\"");

        verify(bookings).cancel(1L, 9L, 4L);
    }

    @Test
    void everyItineraryMutationForwardsParsedParentVersion() {
        ItineraryController controller = new ItineraryController(itineraries, users);
        ItineraryRequest plan = new ItineraryRequest("上海", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 2));
        ItineraryItemRequest item = new ItineraryItemRequest(LocalDate.of(2026, 9, 1),
                ItineraryItemType.NOTE, null, null, "备注", null, null, 0, null);

        controller.update(jwt, 4L, "W/\"5\"", plan);
        controller.delete(jwt, 4L, "6");
        controller.addItem(jwt, 4L, "\"7\"", item);
        controller.updateItem(jwt, 4L, 8L, "W/\"8\"", item);
        controller.deleteItem(jwt, 4L, 8L, "9");

        verify(itineraries).update(1L, 4L, 5L, plan);
        verify(itineraries).delete(1L, 4L, 6L);
        verify(itineraries).addItem(1L, 4L, 7L, item);
        verify(itineraries).updateItem(1L, 4L, 8L, 8L, item);
        verify(itineraries).deleteItem(1L, 4L, 8L, 9L);
    }

    @Test
    void invalidVersionNeverReachesService() {
        ItineraryController controller = new ItineraryController(itineraries, users);

        assertThatThrownBy(() -> controller.delete(jwt, 4L, "*"))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(itineraries);
    }
}
