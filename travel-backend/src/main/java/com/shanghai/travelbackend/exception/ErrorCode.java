package com.shanghai.travelbackend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "请求参数不正确"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "用户名或密码错误"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "请先登录或重新登录"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "请求的资源不存在"),
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "资源已存在"),
    INVALID_STATE(HttpStatus.CONFLICT, "资源状态不允许当前操作"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "服务器暂时无法处理请求");

    private final HttpStatus status;
    private final String defaultMessage;

    ErrorCode(HttpStatus status, String defaultMessage) {
        this.status = status;
        this.defaultMessage = defaultMessage;
    }

    public int getCode() {
        return status.value();
    }
}
