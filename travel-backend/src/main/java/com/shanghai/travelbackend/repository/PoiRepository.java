package com.shanghai.travelbackend.repository;

import com.shanghai.travelbackend.entity.Poi;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface PoiRepository extends JpaRepository<Poi, Long>, JpaSpecificationExecutor<Poi> {
    @EntityGraph(attributePaths = "tags")
    Optional<Poi> findByIdAndActiveTrue(Long id);

    @Override
    @EntityGraph(attributePaths = "tags")
    Optional<Poi> findById(Long id);
}
