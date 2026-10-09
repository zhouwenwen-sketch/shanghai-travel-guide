package com.shanghai.travelbackend.service.impl;

import com.shanghai.travelbackend.dto.PageResponse;
import com.shanghai.travelbackend.dto.PoiResponse;
import com.shanghai.travelbackend.dto.PoiUpsertRequest;
import com.shanghai.travelbackend.entity.Poi;
import com.shanghai.travelbackend.entity.PoiType;
import com.shanghai.travelbackend.exception.BusinessException;
import com.shanghai.travelbackend.exception.ErrorCode;
import com.shanghai.travelbackend.repository.PoiRepository;
import com.shanghai.travelbackend.service.PoiService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PoiServiceImpl implements PoiService {
    private final PoiRepository poiRepository;

    @Override
    public PageResponse<PoiResponse> search(String keyword, PoiType type, String area, int page, int size) {
        return search(keyword, type, area, page, size, false);
    }

    @Override
    public PageResponse<PoiResponse> searchForAdmin(String keyword, PoiType type, String area, int page, int size) {
        return search(keyword, type, area, page, size, true);
    }

    private PageResponse<PoiResponse> search(
            String keyword, PoiType type, String area, int page, int size, boolean includeInactive) {
        String normalizedKeyword = normalize(keyword);
        String normalizedArea = normalize(area);
        Specification<Poi> specification = (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (!includeInactive) predicates.add(builder.isTrue(root.get("active")));
            if (normalizedKeyword != null) {
                String pattern = "%" + normalizedKeyword.toLowerCase() + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("name")), pattern),
                        builder.like(builder.lower(root.get("description")), pattern),
                        builder.like(builder.lower(root.get("address")), pattern)));
            }
            if (type != null) predicates.add(builder.equal(root.get("type"), type));
            if (normalizedArea != null) predicates.add(builder.equal(root.get("area"), normalizedArea));
            return builder.and(predicates.toArray(Predicate[]::new));
        };
        var result = poiRepository.findAll(specification,
                PageRequest.of(page, size, Sort.by(Sort.Order.desc("recommended"), Sort.Order.desc("rating"), Sort.Order.asc("id"))))
                .map(PoiResponse::from);
        return PageResponse.from(result);
    }

    @Override
    public PoiResponse get(Long id) {
        return PoiResponse.from(poiRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> notFound()));
    }

    @Override
    @Transactional
    public PoiResponse create(PoiUpsertRequest request) {
        Poi poi = new Poi();
        apply(poi, request);
        return PoiResponse.from(poiRepository.saveAndFlush(poi));
    }

    @Override
    @Transactional
    public PoiResponse update(Long id, PoiUpsertRequest request) {
        Poi poi = poiRepository.findById(id).orElseThrow(this::notFound);
        if (request.version() == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "更新 POI 时必须提供 version");
        }
        if (!request.version().equals(poi.getVersion())) {
            throw new BusinessException(ErrorCode.INVALID_STATE, "POI 已被更新，请刷新后重试");
        }
        apply(poi, request);
        return PoiResponse.from(poiRepository.saveAndFlush(poi));
    }

    @Override
    @Transactional
    public PoiResponse deactivate(Long id, Long expectedVersion) {
        Poi poi = poiRepository.findById(id).orElseThrow(this::notFound);
        if (!expectedVersion.equals(poi.getVersion())) {
            throw new BusinessException(ErrorCode.INVALID_STATE, "POI 已被更新，请刷新后重试");
        }
        poi.setActive(false);
        return PoiResponse.from(poiRepository.saveAndFlush(poi));
    }

    private void apply(Poi poi, PoiUpsertRequest request) {
        poi.setName(request.name().trim());
        poi.setType(request.type());
        poi.setArea(request.area().trim());
        poi.setAddress(request.address().trim());
        poi.setLatitude(request.latitude());
        poi.setLongitude(request.longitude());
        poi.setOpeningHours(normalize(request.openingHours()));
        poi.setTicketPrice(request.ticketPrice());
        poi.setAveragePrice(request.averagePrice());
        poi.setSuggestedDurationMinutes(request.suggestedDurationMinutes());
        poi.setDescription(normalize(request.description()));
        poi.setImageUrl(normalize(request.imageUrl()));
        poi.setRating(request.rating());
        poi.setRecommended(request.recommended());
        poi.setActive(request.active());
        poi.setTags(request.tags() == null ? new ArrayList<>() : new ArrayList<>(new LinkedHashSet<>(
                request.tags().stream().map(String::trim).toList())));
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private BusinessException notFound() {
        return new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "POI 不存在");
    }
}
