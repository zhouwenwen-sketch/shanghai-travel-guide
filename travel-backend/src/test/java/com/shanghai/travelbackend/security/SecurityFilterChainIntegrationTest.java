package com.shanghai.travelbackend.security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.proc.SecurityContext;
import com.shanghai.travelbackend.config.JwtConfig;
import com.shanghai.travelbackend.config.SecurityConfig;
import com.shanghai.travelbackend.config.CorsConfig;
import com.shanghai.travelbackend.controller.BrowseHistoryController;
import com.shanghai.travelbackend.controller.FavoriteController;
import com.shanghai.travelbackend.controller.HotelController;
import com.shanghai.travelbackend.controller.BookingController;
import com.shanghai.travelbackend.controller.ItineraryController;
import com.shanghai.travelbackend.controller.AdminPoiController;
import com.shanghai.travelbackend.exception.RequestLoggingFilter;
import com.shanghai.travelbackend.dto.PageResponse;
import com.shanghai.travelbackend.service.BrowseHistoryService;
import com.shanghai.travelbackend.service.FavoriteService;
import com.shanghai.travelbackend.service.HotelService;
import com.shanghai.travelbackend.service.BookingService;
import com.shanghai.travelbackend.service.ItineraryService;
import com.shanghai.travelbackend.service.PoiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {
        HotelController.class,
        FavoriteController.class,
        BrowseHistoryController.class
        , BookingController.class, ItineraryController.class, AdminPoiController.class
})
@Import({
        SecurityConfig.class,
        CorsConfig.class,
        JwtConfig.class,
        RestAuthenticationEntryPoint.class,
        RestAccessDeniedHandler.class,
        AuthenticatedUserIdResolver.class,
        RequestLoggingFilter.class
})
@TestPropertySource(properties = {
        "app.security.jwt.secret=phase-two-integration-test-secret-key-123456789",
        "app.security.cors.allowed-origins=http://localhost:8080"
})
class SecurityFilterChainIntegrationTest {

    private static final String ISSUER = "shanghai-travel-backend";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtEncoder jwtEncoder;

    @MockBean
    private HotelService hotelService;

    @MockBean
    private FavoriteService favoriteService;

    @MockBean
    private BrowseHistoryService browseHistoryService;
    @MockBean private BookingService bookingService;
    @MockBean private ItineraryService itineraryService;
    @MockBean private PoiService poiService;

    private static final String VALID_POI_REQUEST = """
            {"name":"测试景点","type":"ATTRACTION","area":"黄浦区","address":"测试路1号",
             "latitude":31.23,"longitude":121.47,"recommended":false,"active":true,"tags":[]}
            """;

    @Test
    void publicHotelEndpointAllowsAnonymousRequests() throws Exception {
        when(hotelService.getAllHotels()).thenReturn(List.of());

        mockMvc.perform(get("/api/hotels"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    void favoriteEndpointWithoutTokenReturnsUnifiedUnauthorizedResponse() throws Exception {
        assertUnauthorized("/api/favorites");
    }

    @Test
    void historyEndpointWithoutTokenReturnsUnifiedUnauthorizedResponse() throws Exception {
        assertUnauthorized("/api/history");
    }

    @Test void bookingAndItineraryEndpointsRequireJwt() throws Exception {
        assertUnauthorized("/api/bookings");
        assertUnauthorized("/api/itineraries");
    }

    @Test
    void tokenSignedByAnotherKeyIsRejected() throws Exception {
        JwtEncoder foreignEncoder = encoderWithSecret(
                "different-integration-test-secret-key-1234567890");

        mockMvc.perform(get("/api/favorites")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token(foreignEncoder, "42",
                                Instant.now().minusSeconds(5), Instant.now().plusSeconds(300)))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    void expiredTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/favorites")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token(jwtEncoder, "42",
                                Instant.now().minusSeconds(600), Instant.now().minusSeconds(300)))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.traceId").isNotEmpty());
    }

    @Test
    void tokenWithoutExpirationIsRejected() throws Exception {
        mockMvc.perform(get("/api/favorites")
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenWithoutExpiration(jwtEncoder, "42"))))
                .andExpect(status().isUnauthorized())
                .andExpect(header().exists(RequestLoggingFilter.TRACE_ID_HEADER))
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value("请先登录或重新登录"))
                .andExpect(jsonPath("$.traceId").isNotEmpty())
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    @Test
    void validTokenReachesProtectedControllerUsingSubjectAsUserId() throws Exception {
        when(favoriteService.getUserFavorites(42L)).thenReturn(List.of());

        mockMvc.perform(get("/api/favorites")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token(jwtEncoder, "42",
                                Instant.now().minusSeconds(5), Instant.now().plusSeconds(300)))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(favoriteService).getUserFavorites(42L);
    }

    @Test
    void verifiedTokenWithInvalidSubjectReturnsUnauthorizedInsteadOfServerError() throws Exception {
        mockMvc.perform(get("/api/favorites")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token(jwtEncoder, "not-a-number",
                                Instant.now().minusSeconds(5), Instant.now().plusSeconds(300)))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value("请先登录或重新登录"));
    }

    @Test
    void adminPoiEndpointEnforcesRoleBasedAccess() throws Exception {
        mockMvc.perform(post("/api/admin/pois")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(VALID_POI_REQUEST))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/admin/pois")
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenWithRole("42", "USER")))
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(VALID_POI_REQUEST))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403));

        mockMvc.perform(post("/api/admin/pois")
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenWithRole("1", "ADMIN")))
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(VALID_POI_REQUEST))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    void adminCanListPoisIncludingInactiveThroughDedicatedServiceContract() throws Exception {
        when(poiService.searchForAdmin(null, null, null, 0, 20))
                .thenReturn(new PageResponse<>(List.of(), 0, 20, 0, 0));

        mockMvc.perform(get("/api/admin/pois")
                        .header(HttpHeaders.AUTHORIZATION, bearer(tokenWithRole("1", "ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items").isArray())
                .andExpect(jsonPath("$.data.page").value(0));

        verify(poiService).searchForAdmin(null, null, null, 0, 20);
    }

    @Test
    void corsAllowsConfiguredOriginPutPreflightWithoutAllowingOtherOrigins() throws Exception {
        mockMvc.perform(options("/api/admin/pois/1")
                        .header(HttpHeaders.ORIGIN, "http://localhost:8080")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "PUT")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS,
                                "authorization,content-type,if-match,idempotency-key"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:8080"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
                        org.hamcrest.Matchers.containsString("PUT")))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
                        org.hamcrest.Matchers.allOf(
                                org.hamcrest.Matchers.containsStringIgnoringCase("If-Match"),
                                org.hamcrest.Matchers.containsStringIgnoringCase("Idempotency-Key"))));

        mockMvc.perform(options("/api/admin/pois/1")
                        .header(HttpHeaders.ORIGIN, "https://untrusted.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "PUT"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }

    private void assertUnauthorized(String path) throws Exception {
        mockMvc.perform(get(path))
                .andExpect(status().isUnauthorized())
                .andExpect(header().exists(RequestLoggingFilter.TRACE_ID_HEADER))
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value("请先登录或重新登录"))
                .andExpect(jsonPath("$.traceId").isNotEmpty())
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }

    private String token(JwtEncoder encoder, String subject, Instant issuedAt, Instant expiresAt) {
        JwsHeader headers = JwsHeader.with(MacAlgorithm.HS256).build();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(subject)
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .build();
        return encoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
    }

    private String tokenWithoutExpiration(JwtEncoder encoder, String subject) {
        JwsHeader headers = JwsHeader.with(MacAlgorithm.HS256).build();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(subject)
                .issuedAt(Instant.now().minusSeconds(5))
                .build();
        return encoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
    }

    private String tokenWithRole(String subject, String role) {
        JwsHeader headers = JwsHeader.with(MacAlgorithm.HS256).build();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(subject)
                .issuedAt(Instant.now().minusSeconds(5))
                .expiresAt(Instant.now().plusSeconds(300))
                .claim("roles", List.of(role))
                .build();
        return jwtEncoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
    }

    private JwtEncoder encoderWithSecret(String secret) {
        var secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return new NimbusJwtEncoder(new ImmutableSecret<SecurityContext>(secretKey));
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
