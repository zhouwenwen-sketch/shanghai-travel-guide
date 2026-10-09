package com.shanghai.travelbackend.service.impl;

import com.shanghai.travelbackend.entity.BrowseHistory;
import com.shanghai.travelbackend.entity.Hotel;
import com.shanghai.travelbackend.entity.User;
import com.shanghai.travelbackend.exception.BusinessException;
import com.shanghai.travelbackend.exception.ErrorCode;
import com.shanghai.travelbackend.repository.BrowseHistoryRepository;
import com.shanghai.travelbackend.repository.HotelRepository;
import com.shanghai.travelbackend.repository.UserRepository;
import com.shanghai.travelbackend.service.BrowseHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BrowseHistoryServiceImpl implements BrowseHistoryService {

    private final BrowseHistoryRepository browseHistoryRepository;
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final Clock clock;

    @Override
    public List<BrowseHistory> getUserHistory(Long userId) {
        return browseHistoryRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    @Override
    @Transactional
    public BrowseHistory addHistory(Long userId, Long hotelId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "用户不存在"));
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "酒店不存在"));
        hotel.getTags().size(); // DTO mapping happens after the transaction; initialize the required summary field.
        // 删除同一用户的旧记录（同一酒店只保留最新）
        List<BrowseHistory> oldList = browseHistoryRepository
                .findByUserIdOrderByTimestampDesc(userId);
        oldList.stream()
                .filter(h -> h.getHotel().getId().equals(hotelId))
                .forEach(browseHistoryRepository::delete);

        BrowseHistory history = new BrowseHistory();
        history.setUser(user);
        history.setHotel(hotel);
        history.setTimestamp(clock.millis());
        history = browseHistoryRepository.save(history);

        // 最多保留 20 条
        List<BrowseHistory> all = browseHistoryRepository
                .findByUserIdOrderByTimestampDesc(userId);
        if (all.size() > 20) {
            List<BrowseHistory> toDelete = all.subList(20, all.size());
            browseHistoryRepository.deleteAll(toDelete);
        }
        log.info("event=history_added userId={} hotelId={} historyId={}", userId, hotelId, history.getId());
        return history;
    }

    @Override
    @Transactional
    public void clearHistory(Long userId) {
        browseHistoryRepository.deleteByUserId(userId);
        log.info("event=history_cleared userId={}", userId);
    }
}
