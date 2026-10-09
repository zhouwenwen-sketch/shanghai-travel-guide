package com.shanghai.travelbackend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResult<T> {
    private int code;
    private String message;
    private T data;
    private String traceId;
    private Instant timestamp;

    public static <T> ApiResult<T> ok(T data) {
        return new ApiResult<>(200, "success", data, null, Instant.now());
    }

    public static <T> ApiResult<T> ok() {
        return ok(null);
    }

    public static <T> ApiResult<T> fail(int code, String message, T data, String traceId) {
        return new ApiResult<>(code, message, data, traceId, Instant.now());
    }
}
