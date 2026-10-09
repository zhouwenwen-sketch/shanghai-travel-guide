package com.shanghai.travelbackend.repository;

import com.shanghai.travelbackend.entity.Booking;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    @EntityGraph(attributePaths = "hotel") List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    @EntityGraph(attributePaths = "hotel") Optional<Booking> findByIdAndUserId(Long id, Long userId);
    @EntityGraph(attributePaths = "hotel") Optional<Booking> findByUserIdAndIdempotencyKey(Long userId, String idempotencyKey);
}
