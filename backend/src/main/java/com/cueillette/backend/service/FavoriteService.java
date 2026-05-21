package com.cueillette.backend.service;

import com.cueillette.backend.dto.PickingWithRatingDTO;
import com.cueillette.backend.exception.ConflictException;
import com.cueillette.backend.exception.NotFoundException;
import com.cueillette.backend.model.Favorite;
import com.cueillette.backend.model.Picking;
import com.cueillette.backend.model.User;
import com.cueillette.backend.repository.FavoriteRepository;
import com.cueillette.backend.repository.PickingRepository;
import com.cueillette.backend.repository.ReviewRepository;
import com.cueillette.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final PickingRepository pickingRepository;
    private final ReviewRepository reviewRepository;

    public FavoriteService(FavoriteRepository favoriteRepository,
                          UserRepository userRepository,
                          PickingRepository pickingRepository,
                          ReviewRepository reviewRepository) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.pickingRepository = pickingRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional
    public Favorite addFavorite(String userEmail, Long pickingId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Picking picking = pickingRepository.findById(pickingId)
                .orElseThrow(() -> new NotFoundException("Picking not found"));

        if (favoriteRepository.existsByUserAndPicking(user, picking)) {
            throw new ConflictException("Picking already in favorites");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setPicking(picking);
        favorite.setAddedAt(LocalDateTime.now());

        return favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(String userEmail, Long pickingId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Picking picking = pickingRepository.findById(pickingId)
                .orElseThrow(() -> new NotFoundException("Picking not found"));

        favoriteRepository.deleteByUserAndPicking(user, picking);
    }

    public List<PickingWithRatingDTO> getUserFavorites(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return favoriteRepository.findByUser(user)
                .stream()
                .map(favorite -> {
                    Picking picking = favorite.getPicking();
                    Double avgRating = reviewRepository.getAverageRatingByPickingId(picking.getId());
                    Long reviewCount = reviewRepository.getReviewCountByPickingId(picking.getId());
                    return new PickingWithRatingDTO(picking, avgRating, reviewCount);
                })
                .collect(Collectors.toList());
    }

    public boolean isFavorite(String userEmail, Long pickingId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Picking picking = pickingRepository.findById(pickingId)
                .orElseThrow(() -> new NotFoundException("Picking not found"));

        return favoriteRepository.existsByUserAndPicking(user, picking);
    }
}
