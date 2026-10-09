package com.shanghai.travelbackend.service.impl;

import com.shanghai.travelbackend.entity.Favorite;
import com.shanghai.travelbackend.entity.Hotel;
import com.shanghai.travelbackend.entity.User;
import com.shanghai.travelbackend.exception.BusinessException;
import com.shanghai.travelbackend.exception.ErrorCode;
import com.shanghai.travelbackend.repository.FavoriteRepository;
import com.shanghai.travelbackend.repository.HotelRepository;
import com.shanghai.travelbackend.repository.UserRepository;
import com.shanghai.travelbackend.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FavoriteServiceImpl implements FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;

    @Override
    public List<Favorite> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional
    public Favorite addFavorite(Long userId, Long hotelId) {
        if (favoriteRepository.existsByUserIdAndHotelId(userId, hotelId)) {
            throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "该酒店已收藏");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "用户不存在"));
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "酒店不存在"));
        hotel.getTags().size(); // DTO mapping happens after the transaction; initialize the required summary field.
        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setHotel(hotel);
        Favorite savedFavorite = favoriteRepository.save(favorite);
        log.info("event=favorite_added userId={} hotelId={} favoriteId={}",
                userId, hotelId, savedFavorite.getId());
        return savedFavorite;
    }

    @Override
    @Transactional
    public void removeFavorite(Long userId, Long hotelId) {
        favoriteRepository.findByUserIdAndHotelId(userId, hotelId).ifPresent(favorite -> {
            favoriteRepository.delete(favorite);
            log.info("event=favorite_removed userId={} hotelId={} favoriteId={}",
                    userId, hotelId, favorite.getId());
        });
    }

    @Override
    public boolean isFavorite(Long userId, Long hotelId) {
        return favoriteRepository.existsByUserIdAndHotelId(userId, hotelId);
    }
}
