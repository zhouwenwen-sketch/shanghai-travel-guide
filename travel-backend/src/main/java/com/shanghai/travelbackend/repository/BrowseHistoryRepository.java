package com.shanghai.travelbackend.repository;

import com.shanghai.travelbackend.entity.BrowseHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;

public interface BrowseHistoryRepository extends JpaRepository<BrowseHistory, Long> {
    @EntityGraph(attributePaths = {"hotel", "hotel.tags"})
    List<BrowseHistory> findByUserIdOrderByTimestampDesc(Long userId);

    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
}
