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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PickingRepository pickingRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private FavoriteService favoriteService;

    private final User user = user("user@test.com");
    private final Picking picking = picking(1L);

    @Test
    void addFavorite_throwsWhenUserNotFound() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> favoriteService.addFavorite("missing@test.com", 1L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("User not found");

        verify(favoriteRepository, never()).save(any());
    }

    @Test
    void addFavorite_throwsWhenPickingNotFound() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(pickingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> favoriteService.addFavorite("user@test.com", 1L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Picking not found");
    }

    @Test
    void addFavorite_throwsWhenAlreadyFavorited() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(pickingRepository.findById(1L)).thenReturn(Optional.of(picking));
        when(favoriteRepository.existsByUserAndPicking(user, picking)).thenReturn(true);

        assertThatThrownBy(() -> favoriteService.addFavorite("user@test.com", 1L))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Picking already in favorites");

        verify(favoriteRepository, never()).save(any());
    }

    @Test
    void addFavorite_savesFavorite() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(pickingRepository.findById(1L)).thenReturn(Optional.of(picking));
        when(favoriteRepository.existsByUserAndPicking(user, picking)).thenReturn(false);
        when(favoriteRepository.save(any(Favorite.class))).thenAnswer(invocation -> {
            Favorite favorite = invocation.getArgument(0);
            favorite.setId(100L);
            return favorite;
        });

        Favorite result = favoriteService.addFavorite("user@test.com", 1L);

        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getUser()).isSameAs(user);
        assertThat(result.getPicking()).isSameAs(picking);
        assertThat(result.getAddedAt()).isNotNull();
    }

    @Test
    void removeFavorite_throwsWhenPickingNotFound() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(pickingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> favoriteService.removeFavorite("user@test.com", 1L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Picking not found");
    }

    @Test
    void removeFavorite_deletesFavoriteLink() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(pickingRepository.findById(1L)).thenReturn(Optional.of(picking));

        favoriteService.removeFavorite("user@test.com", 1L);

        verify(favoriteRepository).deleteByUserAndPicking(user, picking);
    }

    @Test
    void getUserFavorites_returnsPickingsWithRatings() {
        Favorite favorite = new Favorite();
        favorite.setPicking(picking);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(favoriteRepository.findByUser(user)).thenReturn(List.of(favorite));
        when(reviewRepository.getAverageRatingByPickingId(1L)).thenReturn(4.5);
        when(reviewRepository.getReviewCountByPickingId(1L)).thenReturn(2L);

        List<PickingWithRatingDTO> result = favoriteService.getUserFavorites("user@test.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getAverageRating()).isEqualTo(4.5);
        assertThat(result.get(0).getReviewCount()).isEqualTo(2L);
    }

    @Test
    void isFavorite_returnsRepositoryResult() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(pickingRepository.findById(1L)).thenReturn(Optional.of(picking));
        when(favoriteRepository.existsByUserAndPicking(user, picking)).thenReturn(true);

        assertThat(favoriteService.isFavorite("user@test.com", 1L)).isTrue();
    }

    private static User user(String email) {
        User user = new User();
        user.setEmail(email);
        return user;
    }

    private static Picking picking(Long id) {
        Picking picking = new Picking();
        picking.setId(id);
        picking.setName("Farm");
        picking.setAddress("1 rue");
        return picking;
    }
}
