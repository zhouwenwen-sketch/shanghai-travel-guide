package com.shanghai.travelbackend.service;

import com.shanghai.travelbackend.entity.BrowseHistory;
import java.util.List;

public interface BrowseHistoryService {
    List<BrowseHistory> getUserHistory(Long userId);
    BrowseHistory addHistory(Long userId, Long hotelId);
    void clearHistory(Long userId);
}
