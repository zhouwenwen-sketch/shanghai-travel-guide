package com.shanghai.travelbackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shanghai.travelbackend.dto.AuthResponse;
import com.shanghai.travelbackend.dto.UserSummary;
import com.shanghai.travelbackend.entity.User;
import com.shanghai.travelbackend.exception.BusinessException;
import com.shanghai.travelbackend.exception.ErrorCode;
import com.shanghai.travelbackend.exception.GlobalExceptionHandler;
import com.shanghai.travelbackend.exception.RequestLoggingFilter;
import com.shanghai.travelbackend.security.JwtTokenService;
import com.shanghai.travelbackend.security.AuthenticatedUserIdResolver;
import com.shanghai.travelbackend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private JwtTokenService jwtTokenService;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new UserController(
                        userService, jwtTokenService, new AuthenticatedUserIdResolver()))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new RequestLoggingFilter())
                .build();
    }

    @Test
    void loginReturnsUnifiedSuccessResponse() throws Exception {
        User user = new User();
        user.setId(7L);
        user.setUsername("demo");
        when(userService.login("demo", "123456")).thenReturn(user);
        when(jwtTokenService.issue(user)).thenReturn(new AuthResponse(
                "signed-token", "Bearer", Instant.parse("2026-08-23T10:00:00Z"),
                new UserSummary(7L, "demo")));

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                java.util.Map.of("username", "demo", "password", "123456"))))
                .andExpect(status().isOk())
                .andExpect(header().string(RequestLoggingFilter.TRACE_ID_HEADER,
                        not(blankOrNullString())))
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("success"))
                .andExpect(jsonPath("$.data.accessToken").value("signed-token"))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.userId").value(7))
                .andExpect(jsonPath("$.data.user.username").value("demo"))
                .andExpect(jsonPath("$.data.user.password").doesNotExist())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void loginRejectsInvalidBodyWithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"d\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("请求参数不正确"))
                .andExpect(jsonPath("$.data.username").exists())
                .andExpect(jsonPath("$.data.password").exists())
                .andExpect(jsonPath("$.traceId", not(blankOrNullString())));
    }

    @Test
    void registerMapsBusinessConflictToHttp409() throws Exception {
        when(userService.register("demo", "123456"))
                .thenThrow(new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "用户名已存在"));

        var result = mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header(RequestLoggingFilter.TRACE_ID_HEADER, "client_request_123")
                        .content("{\"username\":\"demo\",\"password\":\"123456\"}"))
                .andExpect(status().isConflict())
                .andExpect(header().string(RequestLoggingFilter.TRACE_ID_HEADER,
                        not("client_request_123")))
                .andExpect(jsonPath("$.code").value(409))
                .andExpect(jsonPath("$.message").value("用户名已存在"))
                .andExpect(jsonPath("$.traceId", not("client_request_123")))
                .andReturn();

        String serverTraceId = result.getResponse().getHeader(RequestLoggingFilter.TRACE_ID_HEADER);
        String bodyTraceId = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("traceId").asText();
        assertNotEquals("client_request_123", serverTraceId);
        assertEquals(serverTraceId, bodyTraceId);
    }
}
