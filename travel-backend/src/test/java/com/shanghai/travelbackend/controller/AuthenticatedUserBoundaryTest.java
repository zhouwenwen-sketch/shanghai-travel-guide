package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.HotelIdRequest;
import com.shanghai.travelbackend.service.BrowseHistoryService;
import com.shanghai.travelbackend.service.FavoriteService;
import com.shanghai.travelbackend.security.AuthenticatedUserIdResolver;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class AuthenticatedUserBoundaryTest {

    private final Jwt jwt = Jwt.withTokenValue("verified-token")
            .header("alg", "HS256")
            .subject("42")
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .build();

    @Test
    void favoriteUsesVerifiedJwtSubjectAsUserId() {
        FavoriteService service = mock(FavoriteService.class);
        FavoriteController controller = new FavoriteController(service, new AuthenticatedUserIdResolver());

        controller.remove(jwt, 7L);

        verify(service).removeFavorite(42L, 7L);
    }

    @Test
    void historyUsesVerifiedJwtSubjectAsUserId() {
        BrowseHistoryService service = mock(BrowseHistoryService.class);
        BrowseHistoryController controller = new BrowseHistoryController(
                service, new AuthenticatedUserIdResolver());

        controller.clear(jwt);

        verify(service).clearHistory(42L);
    }
}
