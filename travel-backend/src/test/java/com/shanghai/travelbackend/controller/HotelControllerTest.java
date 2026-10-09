package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.HotelListItemResponse;
import com.shanghai.travelbackend.exception.GlobalExceptionHandler;
import com.shanghai.travelbackend.exception.RequestLoggingFilter;
import com.shanghai.travelbackend.service.HotelService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.validation.beanvalidation.MethodValidationPostProcessor;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class HotelControllerTest {

    @Mock
    private HotelService hotelService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        MethodValidationPostProcessor methodValidation = new MethodValidationPostProcessor();
        methodValidation.afterPropertiesSet();
        Object validatedController = methodValidation.postProcessAfterInitialization(
                new HotelController(hotelService), "hotelController");
        mockMvc = MockMvcBuilders
                .standaloneSetup(validatedController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new RequestLoggingFilter())
                .build();
    }

    @Test
    void searchRejectsInvalidStarLevel() throws Exception {
        mockMvc.perform(get("/api/hotels/search").param("starLevel", "6"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("请求参数不正确"));
    }

    @Test
    void searchRejectsUnknownPriceLevel() throws Exception {
        mockMvc.perform(get("/api/hotels/search").param("priceLevel", "unknown"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.traceId").exists());
    }

    @Test
    void recommendedReturnsSummaryWithoutLazyDetailCollections() throws Exception {
        HotelListItemResponse hotel = new HotelListItemResponse(
                1L, "上海和平饭店", true, 5,
                "/images/hotel.jpg", "/images/banner.jpg", "star5.png",
                "南京东路", "021-00000000", "黄浦区", "luxury", 1200,
                "外滩酒店", List.of("外滩", "历史建筑"), 4.8, 1000, "超棒");
        when(hotelService.getRecommendedHotels()).thenReturn(List.of(hotel));

        mockMvc.perform(get("/api/hotels/recommended"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].name").value("上海和平饭店"))
                .andExpect(jsonPath("$.data[0].img_url").value("/images/hotel.jpg"))
                .andExpect(jsonPath("$.data[0].tag[0]").value("外滩"))
                .andExpect(jsonPath("$.data[0].rooms").doesNotExist())
                .andExpect(jsonPath("$.data[0].reviews").doesNotExist());
    }
}
