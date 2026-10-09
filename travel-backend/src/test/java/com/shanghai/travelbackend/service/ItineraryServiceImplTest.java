package com.shanghai.travelbackend.service;

import com.shanghai.travelbackend.dto.*;
import com.shanghai.travelbackend.entity.*;
import com.shanghai.travelbackend.exception.BusinessException;
import com.shanghai.travelbackend.repository.*;
import com.shanghai.travelbackend.service.impl.ItineraryServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.*;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItineraryServiceImplTest {
    @Mock ItineraryRepository itineraries; @Mock UserRepository users; @Mock HotelRepository hotels; @Mock PoiRepository pois;
    ItineraryServiceImpl service;
    private final Clock clock=Clock.fixed(Instant.parse("2026-09-01T10:15:30Z"),ZoneOffset.UTC);
    private Itinerary plan;
    @BeforeEach void setup(){service=new ItineraryServiceImpl(itineraries,users,hotels,pois,clock);plan=new Itinerary();plan.setId(4L);plan.setVersion(3L);plan.setTitle("上海三日游");plan.setCreatedAt(LocalDateTime.of(2026,8,1,9,0));plan.setUpdatedAt(LocalDateTime.of(2026,8,1,9,0));User u=new User();u.setId(1L);plan.setUser(u);plan.setStartDate(LocalDate.of(2026,9,1));plan.setEndDate(LocalDate.of(2026,9,3));plan.setItems(new ArrayList<>());}
    @Test void validatesItemDateAndTime() {
        when(itineraries.findDetailedByIdAndUserId(4L,1L)).thenReturn(Optional.of(plan));
        assertThatThrownBy(()->service.addItem(1L,4L,3L,new ItineraryItemRequest(LocalDate.of(2026,9,4),ItineraryItemType.NOTE,null,null,"x",null,null,0,null))).isInstanceOf(BusinessException.class);
        assertThatThrownBy(()->service.addItem(1L,4L,3L,new ItineraryItemRequest(LocalDate.of(2026,9,2),ItineraryItemType.NOTE,LocalTime.NOON,LocalTime.of(11,0),"x",null,null,0,null))).isInstanceOf(BusinessException.class);
    }
    @Test void addsValidItemWithStableDayContract() {
        when(itineraries.findDetailedByIdAndUserId(4L,1L)).thenReturn(Optional.of(plan));
        when(itineraries.saveAndFlush(plan)).thenAnswer(i->{plan.getItems().get(0).setId(7L);plan.setVersion(4L);return plan;});
        ItineraryResponse result=service.addItem(1L,4L,3L,new ItineraryItemRequest(LocalDate.of(2026,9,2),ItineraryItemType.ATTRACTION,LocalTime.of(9,0),LocalTime.of(10,0),"外滩","上海",null,3,null));
        assertThat(result.version()).isEqualTo(4L);assertThat(result.items()).singleElement().satisfies(saved->{assertThat(saved.dayNumber()).isEqualTo(2);assertThat(saved.sortOrder()).isEqualTo(3);assertThat(saved.poiActive()).isNull();});
        assertThat(result.updatedAt()).isEqualTo(LocalDateTime.of(2026,9,1,10,15,30));
    }
    @Test void refusesToShrinkPlanAcrossExistingItemAndHidesOtherUsersPlan() {
        ItineraryItem existing=new ItineraryItem();existing.setItemDate(LocalDate.of(2026,9,3));plan.getItems().add(existing);
        when(itineraries.findDetailedByIdAndUserId(4L,1L)).thenReturn(Optional.of(plan));
        assertThatThrownBy(()->service.update(1L,4L,3L,new ItineraryRequest("短行程",LocalDate.of(2026,9,1),LocalDate.of(2026,9,2)))).isInstanceOf(BusinessException.class);
        when(itineraries.findByIdAndUserId(4L,2L)).thenReturn(Optional.empty());
        assertThatThrownBy(()->service.delete(2L,4L,3L)).isInstanceOf(BusinessException.class);
    }

    @Test void rejectsStaleVersionBeforeUpdating() {
        when(itineraries.findDetailedByIdAndUserId(4L, 1L)).thenReturn(Optional.of(plan));

        assertThatThrownBy(() -> service.update(1L, 4L, 2L,
                new ItineraryRequest("上海三日游", LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 3))))
                .isInstanceOf(BusinessException.class);

        verify(itineraries, never()).saveAndFlush(any());
    }

    @Test void rejectsStaleVersionBeforeMutatingItems() {
        when(itineraries.findDetailedByIdAndUserId(4L, 1L)).thenReturn(Optional.of(plan));

        assertThatThrownBy(() -> service.addItem(1L, 4L, 2L,
                new ItineraryItemRequest(LocalDate.of(2026,9,2),ItineraryItemType.NOTE,null,null,"x",null,null,0,null)))
                .isInstanceOf(BusinessException.class).hasMessageContaining("刷新后重试");

        verify(itineraries, never()).saveAndFlush(any());
    }

    @Test void rejectsHotelAndPoiCombinationAndWrongAssociationKinds() {
        when(itineraries.findDetailedByIdAndUserId(4L,1L)).thenReturn(Optional.of(plan));
        LocalDate date = LocalDate.of(2026,9,2);

        assertThatThrownBy(() -> service.addItem(1L,4L,3L,
                new ItineraryItemRequest(date, ItineraryItemType.HOTEL, null, null,
                        "住宿", null, null, 0, 2L, 3L)))
                .isInstanceOf(BusinessException.class).hasMessageContaining("不能同时关联");
        assertThatThrownBy(() -> service.addItem(1L,4L,3L,
                new ItineraryItemRequest(date, ItineraryItemType.NOTE, null, null,
                        "备注", null, null, 0, 2L, null)))
                .isInstanceOf(BusinessException.class).hasMessageContaining("HOTEL");
        assertThatThrownBy(() -> service.addItem(1L,4L,3L,
                new ItineraryItemRequest(date, ItineraryItemType.ACTIVITY, null, null,
                        "活动", null, null, 0, null, 3L)))
                .isInstanceOf(BusinessException.class).hasMessageContaining("ATTRACTION");
    }

    @Test void validatesPoiTypeAndReturnsPoiIdentity() {
        when(itineraries.findDetailedByIdAndUserId(4L,1L)).thenReturn(Optional.of(plan));
        Poi restaurant = new Poi(); restaurant.setId(8L); restaurant.setName("本帮菜馆");
        restaurant.setType(PoiType.RESTAURANT); restaurant.setActive(true);
        when(pois.findByIdAndActiveTrue(8L)).thenReturn(Optional.of(restaurant));

        var wrong = new ItineraryItemRequest(LocalDate.of(2026,9,2), ItineraryItemType.ATTRACTION,
                null, null, "吃饭", null, null, 0, null, 8L);
        assertThatThrownBy(() -> service.addItem(1L,4L,3L,wrong))
                .isInstanceOf(BusinessException.class).hasMessageContaining("类型不匹配");

        when(itineraries.saveAndFlush(plan)).thenAnswer(invocation -> {
            plan.getItems().get(0).setId(9L); plan.setVersion(4L); return plan;
        });
        var valid = new ItineraryItemRequest(LocalDate.of(2026,9,2), ItineraryItemType.RESTAURANT,
                null, null, "吃饭", null, null, 0, null, 8L);
        ItineraryResponse response = service.addItem(1L,4L,3L,valid);
        assertThat(response.items()).singleElement().satisfies(item -> {
            assertThat(item.poiId()).isEqualTo(8L);
            assertThat(item.poiName()).isEqualTo("本帮菜馆");
            assertThat(item.poiActive()).isTrue();
        });
    }
}
