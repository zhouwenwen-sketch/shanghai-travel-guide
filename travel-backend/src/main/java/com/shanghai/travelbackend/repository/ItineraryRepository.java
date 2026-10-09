package com.shanghai.travelbackend.repository;

import com.shanghai.travelbackend.entity.Itinerary;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    List<Itinerary> findByUserIdOrderByUpdatedAtDesc(Long userId);
    @EntityGraph(attributePaths = {"items", "items.hotel", "items.poi"}) Optional<Itinerary> findDetailedByIdAndUserId(Long id, Long userId);
    Optional<Itinerary> findByIdAndUserId(Long id, Long userId);
}
