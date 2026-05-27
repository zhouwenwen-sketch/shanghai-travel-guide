package com.shanghai.travelbackend.repository;

import com.shanghai.travelbackend.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface HotelRepository extends JpaRepository<Hotel, Long> {

    List<Hotel> findByRecommendedTrue();

    @Query("SELECT h FROM Hotel h LEFT JOIN FETCH h.rooms WHERE h.id = :id")
    Optional<Hotel> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT h FROM Hotel h WHERE " +
           "(:keyword IS NULL OR h.name LIKE %:keyword% OR h.description LIKE %:keyword%) AND " +
           "(:area IS NULL OR h.area = :area) AND " +
           "(:starLevel IS NULL OR h.starLevel = :starLevel) AND " +
           "(:priceLevel IS NULL OR h.priceLevel = :priceLevel)")
    List<Hotel> search(@Param("keyword") String keyword,
                       @Param("area") String area,
                       @Param("starLevel") Integer starLevel,
                       @Param("priceLevel") String priceLevel);
}
