package com.shanghai.travelbackend.service;

import com.shanghai.travelbackend.dto.*;
import java.util.List;

public interface ItineraryService {
    List<ItineraryResponse> list(Long userId);
    ItineraryResponse get(Long userId, Long id);
    ItineraryResponse create(Long userId, ItineraryRequest request);
    ItineraryResponse update(Long userId, Long id, Long expectedVersion, ItineraryRequest request);
    void delete(Long userId, Long id, Long expectedVersion);
    ItineraryResponse addItem(Long userId, Long id, Long expectedVersion, ItineraryItemRequest request);
    ItineraryResponse updateItem(Long userId, Long id, Long itemId, Long expectedVersion, ItineraryItemRequest request);
    ItineraryResponse deleteItem(Long userId, Long id, Long itemId, Long expectedVersion);
}
