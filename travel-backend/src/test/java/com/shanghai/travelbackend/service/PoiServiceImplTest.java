package com.shanghai.travelbackend.service;

import com.shanghai.travelbackend.dto.PoiUpsertRequest;
import com.shanghai.travelbackend.entity.Poi;
import com.shanghai.travelbackend.entity.PoiType;
import com.shanghai.travelbackend.exception.BusinessException;
import com.shanghai.travelbackend.repository.PoiRepository;
import com.shanghai.travelbackend.service.impl.PoiServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PoiServiceImplTest {
    @Mock private PoiRepository repository;

    @Test
    void mapsEntityPageToStableDtoContract() {
        Poi poi = poi(1L, 0L, PoiType.ATTRACTION);
        when(repository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(poi)));

        var page = new PoiServiceImpl(repository).search("外滩", PoiType.ATTRACTION, "黄浦区", 0, 20);

        assertThat(page.items()).singleElement().satisfies(item -> {
            assertThat(item.name()).isEqualTo("外滩");
            assertThat(item.tags()).containsExactly("夜景");
        });
        assertThat(page.totalElements()).isEqualTo(1);
    }

    @Test
    void updateRequiresMatchingVersion() {
        Poi poi = poi(1L, 2L, PoiType.ATTRACTION);
        when(repository.findById(1L)).thenReturn(Optional.of(poi));
        PoiUpsertRequest request = request(1L);

        assertThatThrownBy(() -> new PoiServiceImpl(repository).update(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("刷新后重试");
    }

    @Test
    void deactivateUsesVersionAndKeepsEntityForExistingItineraryReferences() {
        Poi poi = poi(1L, 2L, PoiType.ATTRACTION);
        when(repository.findById(1L)).thenReturn(Optional.of(poi));
        when(repository.saveAndFlush(poi)).thenAnswer(invocation -> {
            poi.setVersion(3L);
            return poi;
        });

        var response = new PoiServiceImpl(repository).deactivate(1L, 2L);

        assertThat(response.active()).isFalse();
        assertThat(response.version()).isEqualTo(3L);
        verify(repository).saveAndFlush(poi);
    }

    @Test
    void deactivateRejectsStaleVersionWithoutSaving() {
        Poi poi = poi(1L, 2L, PoiType.ATTRACTION);
        when(repository.findById(1L)).thenReturn(Optional.of(poi));

        assertThatThrownBy(() -> new PoiServiceImpl(repository).deactivate(1L, 1L))
                .isInstanceOf(BusinessException.class).hasMessageContaining("刷新后重试");
    }

    private Poi poi(Long id, Long version, PoiType type) {
        Poi poi = new Poi();
        poi.setId(id); poi.setVersion(version); poi.setName("外滩"); poi.setType(type);
        poi.setArea("黄浦区"); poi.setAddress("中山东一路");
        poi.setLatitude(new BigDecimal("31.2400100")); poi.setLongitude(new BigDecimal("121.4904900"));
        poi.setRecommended(true); poi.setActive(true); poi.setTags(new ArrayList<>(List.of("夜景")));
        return poi;
    }

    private PoiUpsertRequest request(Long version) {
        return new PoiUpsertRequest("外滩", PoiType.ATTRACTION, "黄浦区", "中山东一路",
                new BigDecimal("31.2400100"), new BigDecimal("121.4904900"), "全天",
                BigDecimal.ZERO, null, 120, "城市地标", null, new BigDecimal("4.8"),
                true, true, List.of("夜景"), version);
    }
}
