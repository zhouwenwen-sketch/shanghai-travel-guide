package com.shanghai.travelbackend.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(OutputCaptureExtension.class)
class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new HttpErrorController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new RequestLoggingFilter())
                .build();
    }

    @Test
    void preservesNotFoundStatus() throws Exception {
        mockMvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.message").value("请求的资源不存在"))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    void preservesMethodNotAllowedStatus() throws Exception {
        mockMvc.perform(post("/test/get-only"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.code").value(405))
                .andExpect(jsonPath("$.message").value("请求方法不支持"));
    }

    @Test
    void preservesUnsupportedMediaTypeStatus() throws Exception {
        mockMvc.perform(post("/test/json-only")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("not-json"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.code").value(415))
                .andExpect(jsonPath("$.message").value("请求媒体类型不支持"));
    }

    @Test
    void malformedJsonLogDoesNotExposeRawRequestContent(CapturedOutput output) throws Exception {
        String sensitiveMarker = "password-sensitive-marker";

        mockMvc.perform(post("/test/json-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"" + sensitiveMarker + "\""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        assertTrue(output.getAll().contains("type=HttpMessageNotReadableException"));
        assertFalse(output.getAll().contains(sensitiveMarker));
    }

    @RestController
    static class HttpErrorController {

        @GetMapping("/test/not-found")
        void notFound() throws NoResourceFoundException {
            throw new NoResourceFoundException(HttpMethod.GET, "/test/not-found");
        }

        @GetMapping("/test/get-only")
        void getOnly() {
        }

        @PostMapping(value = "/test/json-only", consumes = MediaType.APPLICATION_JSON_VALUE)
        void jsonOnly(@RequestBody Map<String, Object> ignored) {
        }
    }
}
