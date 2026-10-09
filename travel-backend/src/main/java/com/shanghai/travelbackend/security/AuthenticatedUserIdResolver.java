package com.shanghai.travelbackend.security;

import com.shanghai.travelbackend.exception.BusinessException;
import com.shanghai.travelbackend.exception.ErrorCode;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class AuthenticatedUserIdResolver {

    public Long requireUserId(Jwt jwt) {
        if (jwt == null) {
            throw unauthorized();
        }
        try {
            long userId = Long.parseLong(jwt.getSubject());
            if (userId <= 0) {
                throw unauthorized();
            }
            return userId;
        } catch (NumberFormatException exception) {
            throw unauthorized();
        }
    }

    private BusinessException unauthorized() {
        return new BusinessException(ErrorCode.UNAUTHORIZED, "请先登录或重新登录");
    }
}
