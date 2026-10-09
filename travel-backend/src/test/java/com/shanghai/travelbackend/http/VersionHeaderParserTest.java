package com.shanghai.travelbackend.http;

import com.shanghai.travelbackend.exception.BusinessException;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class VersionHeaderParserTest {
    @ParameterizedTest
    @ValueSource(strings = {"4", "\"4\"", "W/\"4\"", "  W/\"4\"  "})
    void acceptsStandardAndLegacyVersionFormats(String value) {
        assertThat(VersionHeaderParser.parse(value)).isEqualTo(4L);
    }

    @ParameterizedTest
    @ValueSource(strings = {"*", "-1", "W/4", "\"-1\"", "4,5", "", "9223372036854775808"})
    void rejectsWildcardNegativeAndMalformedVersions(String value) {
        assertThatThrownBy(() -> VersionHeaderParser.parse(value)).isInstanceOf(BusinessException.class);
    }
}
