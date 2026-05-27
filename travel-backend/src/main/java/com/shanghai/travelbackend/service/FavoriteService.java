package com.shanghai.travelbackend.service;

import com.shanghai.travelbackend.entity.Favorite;
import java.util.List;

public interface FavoriteService {
    List<Favorite> getUserFavorites(Long userId);
    Favorite addFavorite(Long userId, Long hotelId);
    void removeFavorite(Long userId, Long hotelId);
    boolean isFavorite(Long userId, Long hotelId);
}
