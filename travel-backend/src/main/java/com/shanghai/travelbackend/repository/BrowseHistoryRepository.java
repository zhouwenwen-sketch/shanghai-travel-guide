package com.shanghai.travelbackend.repository;

import com.shanghai.travelbackend.entity.BrowseHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface BrowseHistoryRepository extends JpaRepository<BrowseHistory, Long> {
    List<BrowseHistory> findByUserIdOrderByTimestampDesc(Long userId);

    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
}
