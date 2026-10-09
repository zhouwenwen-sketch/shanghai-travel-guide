package com.shanghai.travelbackend.security;

import com.shanghai.travelbackend.config.JwtConfig;
import com.shanghai.travelbackend.dto.AuthResponse;
import com.shanghai.travelbackend.entity.User;
import com.shanghai.travelbackend.entity.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;

import javax.crypto.SecretKey;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokenServiceTest {

    @Test
    void issuedTokenIsLocallyVerifiableAndContainsMinimalIdentity() {
        JwtConfig config = new JwtConfig();
        SecretKey key = config.jwtSecretKey("test-secret-must-have-at-least-32-characters");
        JwtEncoder encoder = config.jwtEncoder(key);
        JwtDecoder decoder = config.jwtDecoder(key);
        Instant now = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.SECONDS);
        JwtTokenService service = new JwtTokenService(
                encoder, Duration.ofHours(2), Clock.fixed(now, ZoneOffset.UTC));
        User user = new User();
        user.setId(12L);
        user.setUsername("demo");
        user.setPassword("must-not-leak");

        AuthResponse response = service.issue(user);
        var jwt = decoder.decode(response.accessToken());

        assertThat(jwt.getSubject()).isEqualTo("12");
        assertThat(jwt.getClaimAsString("username")).isEqualTo("demo");
        assertThat(jwt.getClaimAsStringList("roles")).containsExactly("USER");
        assertThat(response.expiresAt()).isEqualTo(now.plus(Duration.ofHours(2)));
        assertThat(response.user().username()).isEqualTo("demo");
        assertThat(response.user().role()).isEqualTo(UserRole.USER);
        assertThat(response.toString()).doesNotContain("must-not-leak");
    }

    @Test
    void rejectsShortSecret() {
        assertThatThrownBy(() -> new JwtConfig().jwtSecretKey("too-short"))
                .isInstanceOf(IllegalStateException.class);
    }
}
