package com.shanghai.travelbackend.repository;

import com.shanghai.travelbackend.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    @EntityGraph(attributePaths = {"hotel", "hotel.tags"})
    List<Favorite> findByUserIdOrderByCreatedAtDesc(Long userId);
    @EntityGraph(attributePaths = {"hotel", "hotel.tags"})
    Optional<Favorite> findByUserIdAndHotelId(Long userId, Long hotelId);
    boolean existsByUserIdAndHotelId(Long userId, Long hotelId);
}
