package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.PageResponse;
import com.shanghai.travelbackend.dto.PoiResponse;
import com.shanghai.travelbackend.entity.PoiType;
import com.shanghai.travelbackend.exception.GlobalExceptionHandler;
import com.shanghai.travelbackend.exception.RequestLoggingFilter;
import com.shanghai.travelbackend.service.PoiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.validation.beanvalidation.MethodValidationPostProcessor;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PoiControllerTest {
    @Mock private PoiService poiService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        MethodValidationPostProcessor validation = new MethodValidationPostProcessor();
        validation.afterPropertiesSet();
        Object controller = validation.postProcessAfterInitialization(new PoiController(poiService), "poiController");
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new RequestLoggingFilter())
                .build();
    }

    @Test
    void returnsServerPageContractAndCamelCaseFields() throws Exception {
        PoiResponse poi = new PoiResponse(1L, "外滩", PoiType.ATTRACTION, "黄浦区", "中山东一路",
                new BigDecimal("31.2400100"), new BigDecimal("121.4904900"), "全天开放",
                BigDecimal.ZERO, null, 120, "城市地标", "/image.jpg", new BigDecimal("4.8"),
                true, true, List.of("夜景"), 0L);
        when(poiService.search("外滩", PoiType.ATTRACTION, "黄浦区", 0, 10))
                .thenReturn(new PageResponse<>(List.of(poi), 0, 10, 1, 1));

        mockMvc.perform(get("/api/pois")
                        .param("keyword", "外滩").param("type", "ATTRACTION")
                        .param("area", "黄浦区").param("page", "0").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].imageUrl").value("/image.jpg"))
                .andExpect(jsonPath("$.data.items[0].suggestedDurationMinutes").value(120))
                .andExpect(jsonPath("$.data.totalElements").value(1));
        verify(poiService).search("外滩", PoiType.ATTRACTION, "黄浦区", 0, 10);
    }

    @Test
    void rejectsPageSizeAboveLimit() throws Exception {
        mockMvc.perform(get("/api/pois").param("size", "51"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }
}
