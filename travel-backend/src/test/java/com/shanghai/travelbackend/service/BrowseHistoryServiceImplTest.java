package com.shanghai.travelbackend.service;

import com.shanghai.travelbackend.entity.BrowseHistory;
import com.shanghai.travelbackend.entity.Hotel;
import com.shanghai.travelbackend.entity.User;
import com.shanghai.travelbackend.repository.BrowseHistoryRepository;
import com.shanghai.travelbackend.repository.HotelRepository;
import com.shanghai.travelbackend.repository.UserRepository;
import com.shanghai.travelbackend.service.impl.BrowseHistoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BrowseHistoryServiceImplTest {
    @Mock private BrowseHistoryRepository histories;
    @Mock private UserRepository users;
    @Mock private HotelRepository hotels;

    private BrowseHistoryServiceImpl service;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-09-01T10:15:30Z"), ZoneOffset.UTC);
        service = new BrowseHistoryServiceImpl(histories, users, hotels, clock);
    }

    @Test
    void addsHistoryUsingTheInjectedClock() {
        User user = new User();
        user.setId(1L);
        Hotel hotel = new Hotel();
        hotel.setId(2L);
        hotel.setTags(new ArrayList<>());
        when(users.findById(1L)).thenReturn(Optional.of(user));
        when(hotels.findById(2L)).thenReturn(Optional.of(hotel));
        when(histories.findByUserIdOrderByTimestampDesc(1L)).thenReturn(List.of());
        when(histories.save(any(BrowseHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.addHistory(1L, 2L);

        ArgumentCaptor<BrowseHistory> captor = ArgumentCaptor.forClass(BrowseHistory.class);
        verify(histories).save(captor.capture());
        assertThat(captor.getValue().getTimestamp()).isEqualTo(1788257730000L);
    }
}
