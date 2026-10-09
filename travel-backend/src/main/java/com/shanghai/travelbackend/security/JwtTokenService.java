package com.shanghai.travelbackend.security;

import com.shanghai.travelbackend.dto.AuthResponse;
import com.shanghai.travelbackend.dto.UserSummary;
import com.shanghai.travelbackend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class JwtTokenService {

    private static final String ISSUER = "shanghai-travel-backend";

    private final JwtEncoder jwtEncoder;
    private final Duration ttl;
    private final Clock clock;

    @Autowired
    public JwtTokenService(JwtEncoder jwtEncoder,
                           @Value("${app.security.jwt.ttl}") Duration ttl) {
        this(jwtEncoder, ttl, Clock.systemUTC());
    }

    JwtTokenService(JwtEncoder jwtEncoder, Duration ttl, Clock clock) {
        if (ttl.isNegative() || ttl.isZero()) {
            throw new IllegalArgumentException("JWT_TTL must be positive");
        }
        this.jwtEncoder = jwtEncoder;
        this.ttl = ttl;
        this.clock = clock;
    }

    public AuthResponse issue(User user) {
        Instant issuedAt = clock.instant();
        Instant expiresAt = issuedAt.plus(ttl);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(user.getId().toString())
                .claim("username", user.getUsername())
                .claim("roles", List.of(user.getRole().name()))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new AuthResponse(token, "Bearer", expiresAt, UserSummary.from(user));
    }
}
