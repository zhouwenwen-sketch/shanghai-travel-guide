package com.shanghai.travelbackend.exception;

import com.shanghai.travelbackend.dto.ApiResult;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResult<Void>> handleBusinessException(
            BusinessException exception, HttpServletRequest request) {
        ErrorCode errorCode = exception.getErrorCode();
        log.warn("event=business_error method={} path={} code={} message={}",
                request.getMethod(), request.getRequestURI(), errorCode.name(), exception.getMessage());
        return response(errorCode.getStatus(), exception.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResult<Map<String, String>>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception, HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            errors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }
        log.warn("event=validation_error method={} path={} fields={}",
                request.getMethod(), request.getRequestURI(), errors.keySet());
        return response(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST.getDefaultMessage(), errors);
    }

    @ExceptionHandler({
            ConstraintViolationException.class,
            HandlerMethodValidationException.class,
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<ApiResult<Void>> handleInvalidRequest(
            Exception exception, HttpServletRequest request) {
        log.warn("event=validation_error method={} path={} type={}",
                request.getMethod(), request.getRequestURI(), exception.getClass().getSimpleName());
        return response(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST.getDefaultMessage(), null);
    }

    @ExceptionHandler({
            ErrorResponseException.class,
            NoResourceFoundException.class,
            NoHandlerFoundException.class,
            HttpRequestMethodNotSupportedException.class,
            HttpMediaTypeNotSupportedException.class
    })
    public ResponseEntity<ApiResult<Void>> handleHttpError(
            Exception exception, HttpServletRequest request) {
        HttpStatusCode status = ((ErrorResponse) exception).getStatusCode();
        log.warn("event=http_error method={} path={} status={} type={}",
                request.getMethod(), request.getRequestURI(), status.value(),
                exception.getClass().getSimpleName());
        return response(status, messageFor(status), null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResult<Void>> handleDataIntegrityViolation(
            DataIntegrityViolationException exception, HttpServletRequest request) {
        log.warn("event=data_conflict method={} path={} type={}",
                request.getMethod(), request.getRequestURI(), exception.getClass().getSimpleName());
        return response(HttpStatus.CONFLICT, ErrorCode.DUPLICATE_RESOURCE.getDefaultMessage(), null);
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiResult<Void>> handleOptimisticLockingFailure(
            ObjectOptimisticLockingFailureException exception, HttpServletRequest request) {
        log.warn("event=optimistic_lock_conflict method={} path={} type={}",
                request.getMethod(), request.getRequestURI(), exception.getClass().getSimpleName());
        return response(HttpStatus.CONFLICT, "数据已被更新，请刷新后重试", null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResult<Void>> handleUnexpectedException(
            Exception exception, HttpServletRequest request) {
        log.error("event=unexpected_error method={} path={}",
                request.getMethod(), request.getRequestURI(), exception);
        return response(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR.getDefaultMessage(), null);
    }

    private String messageFor(HttpStatusCode status) {
        return switch (status.value()) {
            case 404 -> ErrorCode.RESOURCE_NOT_FOUND.getDefaultMessage();
            case 405 -> "请求方法不支持";
            case 415 -> "请求媒体类型不支持";
            default -> status.is4xxClientError()
                    ? ErrorCode.INVALID_REQUEST.getDefaultMessage()
                    : ErrorCode.INTERNAL_ERROR.getDefaultMessage();
        };
    }

    private <T> ResponseEntity<ApiResult<T>> response(HttpStatusCode status, String message, T data) {
        return ResponseEntity.status(status)
                .body(ApiResult.fail(status.value(), message, data, MDC.get(RequestLoggingFilter.TRACE_ID_KEY)));
    }
}
