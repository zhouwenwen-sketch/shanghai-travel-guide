package com.shanghai.travelbackend.service.impl;

import com.shanghai.travelbackend.dto.*;
import com.shanghai.travelbackend.entity.*;
import com.shanghai.travelbackend.exception.*;
import com.shanghai.travelbackend.repository.*;
import com.shanghai.travelbackend.service.ItineraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class ItineraryServiceImpl implements ItineraryService {
    private final ItineraryRepository itineraryRepository;
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final PoiRepository poiRepository;
    private final Clock clock;

    @Override public List<ItineraryResponse> list(Long userId) {
        return itineraryRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream().map(ItineraryResponse::summary).toList();
    }
    @Override public ItineraryResponse get(Long userId, Long id) { return ItineraryResponse.detail(requireDetailed(userId, id)); }
    @Override @Transactional public ItineraryResponse create(Long userId, ItineraryRequest request) {
        validateRange(request.startDate(), request.endDate());
        User user = userRepository.findById(userId).orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        LocalDateTime now = LocalDateTime.now(clock);
        Itinerary itinerary = new Itinerary();
        itinerary.setUser(user); itinerary.setTitle(request.title().trim());
        itinerary.setStartDate(request.startDate()); itinerary.setEndDate(request.endDate());
        itinerary.setCreatedAt(now); itinerary.setUpdatedAt(now);
        return ItineraryResponse.detail(itineraryRepository.save(itinerary));
    }
    @Override @Transactional public ItineraryResponse update(Long userId, Long id, Long expectedVersion, ItineraryRequest request) {
        validateRange(request.startDate(), request.endDate());
        Itinerary itinerary = requireDetailed(userId, id);
        requireVersion(itinerary, expectedVersion);
        boolean outOfRange = itinerary.getItems().stream().anyMatch(item ->
                item.getItemDate().isBefore(request.startDate()) || item.getItemDate().isAfter(request.endDate()));
        if (outOfRange) throw invalid("新的行程日期范围会使已有项目越界，请先调整或删除项目");
        itinerary.setTitle(request.title().trim()); itinerary.setStartDate(request.startDate());
        itinerary.setEndDate(request.endDate()); touch(itinerary);
        itinerary.getItems().forEach(item -> item.setDayNumber(dayNumber(itinerary, item.getItemDate())));
        return ItineraryResponse.detail(itineraryRepository.saveAndFlush(itinerary));
    }
    @Override @Transactional public void delete(Long userId, Long id, Long expectedVersion) {
        Itinerary itinerary = requireOwned(userId, id);
        requireVersion(itinerary, expectedVersion);
        itineraryRepository.delete(itinerary);
        itineraryRepository.flush();
    }
    @Override @Transactional public ItineraryResponse addItem(Long userId, Long id, Long expectedVersion, ItineraryItemRequest request) {
        Itinerary itinerary = requireDetailed(userId, id);
        requireVersion(itinerary, expectedVersion);
        validateItem(itinerary, request);
        ItineraryItem item = new ItineraryItem();
        apply(item, itinerary, request);
        itinerary.getItems().add(item);
        touch(itinerary);
        return ItineraryResponse.detail(itineraryRepository.saveAndFlush(itinerary));
    }
    @Override @Transactional public ItineraryResponse updateItem(Long userId, Long id, Long itemId, Long expectedVersion, ItineraryItemRequest request) {
        Itinerary itinerary = requireDetailed(userId, id);
        requireVersion(itinerary, expectedVersion);
        ItineraryItem item = itinerary.getItems().stream().filter(existing -> existing.getId().equals(itemId)).findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "行程项目不存在"));
        validateItem(itinerary, request); apply(item, itinerary, request);
        touch(itinerary);
        return ItineraryResponse.detail(itineraryRepository.saveAndFlush(itinerary));
    }
    @Override @Transactional public ItineraryResponse deleteItem(Long userId, Long id, Long itemId, Long expectedVersion) {
        Itinerary itinerary = requireDetailed(userId, id);
        requireVersion(itinerary, expectedVersion);
        ItineraryItem item = itinerary.getItems().stream().filter(existing -> existing.getId().equals(itemId)).findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "行程项目不存在"));
        itinerary.getItems().remove(item);
        touch(itinerary);
        return ItineraryResponse.detail(itineraryRepository.saveAndFlush(itinerary));
    }
    private void apply(ItineraryItem item, Itinerary itinerary, ItineraryItemRequest r) {
        Hotel hotel = r.hotelId() == null ? null : hotelRepository.findById(r.hotelId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "关联酒店不存在"));
        Poi poi = r.poiId() == null ? null : poiRepository.findByIdAndActiveTrue(r.poiId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "关联 POI 不存在"));
        if (poi != null && !poi.getType().name().equals(r.type().name())) {
            throw invalid("POI 类型与行程项目类型不匹配");
        }
        item.setItinerary(itinerary); item.setItemDate(r.itemDate()); item.setDayNumber(dayNumber(itinerary, r.itemDate()));
        item.setType(r.type()); item.setStartTime(r.startTime()); item.setEndTime(r.endTime());
        item.setTitle(r.title().trim()); item.setLocation(trim(r.location())); item.setNotes(trim(r.notes()));
        item.setSortOrder(r.sortOrder());
        item.setHotel(hotel);
        item.setPoi(poi);
    }
    private void validateRange(LocalDate start, LocalDate end) {
        if (end.isBefore(start)) throw invalid("行程结束日期不能早于开始日期");
        if (ChronoUnit.DAYS.between(start, end) > 30) throw invalid("单个行程最多31天");
    }
    private void validateItem(Itinerary i, ItineraryItemRequest r) {
        if (r.itemDate().isBefore(i.getStartDate()) || r.itemDate().isAfter(i.getEndDate())) throw invalid("项目日期必须在行程范围内");
        if ((r.startTime() == null) != (r.endTime() == null)) throw invalid("开始时间和结束时间必须同时填写或同时留空");
        if (r.startTime() != null && !r.endTime().isAfter(r.startTime())) throw invalid("结束时间必须晚于开始时间");
        if (r.hotelId() != null && r.poiId() != null) throw invalid("酒店和 POI 不能同时关联");
        if (r.hotelId() != null && r.type() != ItineraryItemType.HOTEL) throw invalid("hotelId 只能用于 HOTEL 类型项目");
        if (r.poiId() != null && r.type() != ItineraryItemType.ATTRACTION
                && r.type() != ItineraryItemType.RESTAURANT) {
            throw invalid("poiId 只能用于 ATTRACTION 或 RESTAURANT 类型项目");
        }
    }
    private int dayNumber(Itinerary i, LocalDate date) { return (int) ChronoUnit.DAYS.between(i.getStartDate(), date) + 1; }
    private void touch(Itinerary itinerary) {
        LocalDateTime now = LocalDateTime.now(clock);
        if (itinerary.getUpdatedAt() != null && !now.isAfter(itinerary.getUpdatedAt())) {
            now = itinerary.getUpdatedAt().plusNanos(1_000);
        }
        itinerary.setUpdatedAt(now);
    }
    private void requireVersion(Itinerary itinerary, Long expectedVersion) {
        if (!itinerary.getVersion().equals(expectedVersion)) {
            throw new BusinessException(ErrorCode.INVALID_STATE, "行程已被更新，请刷新后重试");
        }
    }
    private Itinerary requireOwned(Long userId, Long id) { return itineraryRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "行程不存在")); }
    private Itinerary requireDetailed(Long userId, Long id) { return itineraryRepository.findDetailedByIdAndUserId(id, userId)
            .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "行程不存在")); }
    private String trim(String value) { return value == null ? null : value.trim(); }
    private BusinessException invalid(String message) { return new BusinessException(ErrorCode.INVALID_REQUEST, message); }
}
