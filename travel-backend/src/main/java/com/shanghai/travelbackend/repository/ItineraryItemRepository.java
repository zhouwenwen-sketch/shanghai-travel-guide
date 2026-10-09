package com.shanghai.travelbackend.repository;

import com.shanghai.travelbackend.entity.ItineraryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, Long> {
    Optional<ItineraryItem> findByIdAndItineraryIdAndItineraryUserId(Long id, Long itineraryId, Long userId);
}
