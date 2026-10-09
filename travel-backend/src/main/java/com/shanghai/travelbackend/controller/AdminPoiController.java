package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.ApiResult;
import com.shanghai.travelbackend.dto.PoiResponse;
import com.shanghai.travelbackend.dto.PoiUpsertRequest;
import com.shanghai.travelbackend.dto.PageResponse;
import com.shanghai.travelbackend.entity.PoiType;
import com.shanghai.travelbackend.http.VersionHeaderParser;
import com.shanghai.travelbackend.service.PoiService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/admin/pois")
@RequiredArgsConstructor
public class AdminPoiController {
    private final PoiService poiService;

    @GetMapping
    public ApiResult<PageResponse<PoiResponse>> search(
            @RequestParam(required = false) @Size(max = 100) String keyword,
            @RequestParam(required = false) PoiType type,
            @RequestParam(required = false) @Size(max = 50) String area,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int size) {
        return ApiResult.ok(poiService.searchForAdmin(keyword, type, area, page, size));
    }

    @PostMapping
    public ApiResult<PoiResponse> create(@Valid @RequestBody PoiUpsertRequest request) {
        return ApiResult.ok(poiService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResult<PoiResponse> update(@PathVariable @Positive Long id,
                                         @Valid @RequestBody PoiUpsertRequest request) {
        return ApiResult.ok(poiService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResult<PoiResponse> delete(@PathVariable @Positive Long id,
                                         @RequestHeader("If-Match") String ifMatch) {
        return ApiResult.ok(poiService.deactivate(id, VersionHeaderParser.parse(ifMatch)));
    }
}
