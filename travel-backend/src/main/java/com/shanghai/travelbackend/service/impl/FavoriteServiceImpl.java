package com.shanghai.travelbackend.service.impl;

import com.shanghai.travelbackend.entity.Favorite;
import com.shanghai.travelbackend.entity.Hotel;
import com.shanghai.travelbackend.entity.User;
import com.shanghai.travelbackend.repository.FavoriteRepository;
import com.shanghai.travelbackend.repository.HotelRepository;
import com.shanghai.travelbackend.repository.UserRepository;
import com.shanghai.travelbackend.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
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
            throw new RuntimeException("已收藏");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("酒店不存在"));
        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setHotel(hotel);
        return favoriteRepository.save(favorite);
    }

    @Override
    @Transactional
    public void removeFavorite(Long userId, Long hotelId) {
        favoriteRepository.findByUserIdAndHotelId(userId, hotelId)
                .ifPresent(favoriteRepository::delete);
    }

    @Override
    public boolean isFavorite(Long userId, Long hotelId) {
        return favoriteRepository.existsByUserIdAndHotelId(userId, hotelId);
    }
}
