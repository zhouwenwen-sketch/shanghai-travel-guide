package com.shanghai.travelbackend.controller;

import com.shanghai.travelbackend.dto.ApiResult;
import com.shanghai.travelbackend.entity.BrowseHistory;
import com.shanghai.travelbackend.service.BrowseHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class BrowseHistoryController {

    private final BrowseHistoryService browseHistoryService;

    @GetMapping
    public ApiResult<List<BrowseHistory>> list(@RequestParam Long userId) {
        return ApiResult.ok(browseHistoryService.getUserHistory(userId));
    }

    @PostMapping
    public ApiResult<BrowseHistory> add(@RequestBody Map<String, Long> body) {
        BrowseHistory history = browseHistoryService.addHistory(
                body.get("userId"), body.get("hotelId"));
        return ApiResult.ok(history);
    }

    @DeleteMapping
    public ApiResult<Void> clear(@RequestParam Long userId) {
        browseHistoryService.clearHistory(userId);
        return ApiResult.ok();
    }
}
