package com.shanghai.travelbackend.service;

import com.shanghai.travelbackend.dto.PageResponse;
import com.shanghai.travelbackend.dto.PoiResponse;
import com.shanghai.travelbackend.dto.PoiUpsertRequest;
import com.shanghai.travelbackend.entity.PoiType;

public interface PoiService {
    PageResponse<PoiResponse> search(String keyword, PoiType type, String area, int page, int size);
    PageResponse<PoiResponse> searchForAdmin(String keyword, PoiType type, String area, int page, int size);
    PoiResponse get(Long id);
    PoiResponse create(PoiUpsertRequest request);
    PoiResponse update(Long id, PoiUpsertRequest request);
    PoiResponse deactivate(Long id, Long expectedVersion);
}
