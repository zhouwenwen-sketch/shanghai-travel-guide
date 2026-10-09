package com.shanghai.travelbackend.http;

import com.shanghai.travelbackend.exception.BusinessException;
import com.shanghai.travelbackend.exception.ErrorCode;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class VersionHeaderParser {
    private static final Pattern VERSION = Pattern.compile("^(?:W/)?\"([0-9]+)\"$|^([0-9]+)$");

    private VersionHeaderParser() {
    }

    public static Long parse(String value) {
        if (value == null) {
            throw invalid();
        }
        Matcher matcher = VERSION.matcher(value.trim());
        if (!matcher.matches()) {
            throw invalid();
        }
        String number = matcher.group(1) != null ? matcher.group(1) : matcher.group(2);
        try {
            return Long.valueOf(number);
        } catch (NumberFormatException exception) {
            throw invalid();
        }
    }

    private static BusinessException invalid() {
        return new BusinessException(ErrorCode.INVALID_REQUEST,
                "If-Match 必须是非负版本号，例如 4、\"4\" 或 W/\"4\"");
    }
}
