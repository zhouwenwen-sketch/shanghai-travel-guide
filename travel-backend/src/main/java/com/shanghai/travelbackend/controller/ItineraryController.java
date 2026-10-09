package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.*;
import com.shanghai.travelbackend.http.VersionHeaderParser;
import com.shanghai.travelbackend.security.AuthenticatedUserIdResolver;
import com.shanghai.travelbackend.service.ItineraryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Validated @RestController @RequestMapping("/api/itineraries") @RequiredArgsConstructor
public class ItineraryController {
    private final ItineraryService service;
    private final AuthenticatedUserIdResolver users;
    @GetMapping public ApiResult<List<ItineraryResponse>> list(@AuthenticationPrincipal Jwt jwt) { return ApiResult.ok(service.list(users.requireUserId(jwt))); }
    @GetMapping("/{id}") public ApiResult<ItineraryResponse> get(@AuthenticationPrincipal Jwt jwt, @PathVariable @Positive Long id) { return ApiResult.ok(service.get(users.requireUserId(jwt), id)); }
    @PostMapping public ApiResult<ItineraryResponse> create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ItineraryRequest request) { return ApiResult.ok(service.create(users.requireUserId(jwt), request)); }
    @PutMapping("/{id}") public ApiResult<ItineraryResponse> update(@AuthenticationPrincipal Jwt jwt,
            @PathVariable @Positive Long id, @RequestHeader("If-Match") String ifMatch,
            @Valid @RequestBody ItineraryRequest request) {
        return ApiResult.ok(service.update(users.requireUserId(jwt), id, VersionHeaderParser.parse(ifMatch), request));
    }
    @DeleteMapping("/{id}") public ApiResult<Void> delete(@AuthenticationPrincipal Jwt jwt,
            @PathVariable @Positive Long id, @RequestHeader("If-Match") String ifMatch) {
        service.delete(users.requireUserId(jwt), id, VersionHeaderParser.parse(ifMatch)); return ApiResult.ok();
    }
    @PostMapping("/{id}/items") public ApiResult<ItineraryResponse> addItem(@AuthenticationPrincipal Jwt jwt,
            @PathVariable @Positive Long id, @RequestHeader("If-Match") String ifMatch,
            @Valid @RequestBody ItineraryItemRequest request) {
        return ApiResult.ok(service.addItem(users.requireUserId(jwt), id, VersionHeaderParser.parse(ifMatch), request));
    }
    @PutMapping("/{id}/items/{itemId}") public ApiResult<ItineraryResponse> updateItem(@AuthenticationPrincipal Jwt jwt,
            @PathVariable @Positive Long id, @PathVariable @Positive Long itemId,
            @RequestHeader("If-Match") String ifMatch, @Valid @RequestBody ItineraryItemRequest request) {
        return ApiResult.ok(service.updateItem(users.requireUserId(jwt), id, itemId, VersionHeaderParser.parse(ifMatch), request));
    }
    @DeleteMapping("/{id}/items/{itemId}") public ApiResult<ItineraryResponse> deleteItem(@AuthenticationPrincipal Jwt jwt,
            @PathVariable @Positive Long id, @PathVariable @Positive Long itemId,
            @RequestHeader("If-Match") String ifMatch) {
        return ApiResult.ok(service.deleteItem(users.requireUserId(jwt), id, itemId, VersionHeaderParser.parse(ifMatch)));
    }
}
