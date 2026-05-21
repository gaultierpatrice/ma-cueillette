package com.cueillette.backend.service;

import com.cueillette.backend.exception.NotFoundException;
import com.cueillette.backend.model.Picking;
import com.cueillette.backend.model.Review;
import com.cueillette.backend.model.User;
import com.cueillette.backend.repository.PickingRepository;
import com.cueillette.backend.repository.ReviewRepository;
import com.cueillette.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PickingRepository pickingRepository;

    @InjectMocks
    private ReviewService reviewService;

    @Test
    void getReviewsByPickingId_delegatesToRepository() {
        Review review = new Review();
        review.setId(1L);
        when(reviewRepository.findByPickingIdOrderByPublishedAtDesc(5L)).thenReturn(List.of(review));

        List<Review> result = reviewService.getReviewsByPickingId(5L);

        assertThat(result).containsExactly(review);
    }

    @Test
    void createReview_throwsWhenUserNotFound() {
        when(userRepository.findByEmail("missing@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.createReview(1L, "missing@test.com", 5, "Nice"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("User not found");

        verify(reviewRepository, never()).save(any());
    }

    @Test
    void createReview_throwsWhenPickingNotFound() {
        User user = new User();
        user.setEmail("user@test.com");
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(pickingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.createReview(1L, "user@test.com", 5, "Nice"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Picking not found");
    }

    @Test
    void createReview_persistsReviewWithRatingAndComment() {
        User user = new User();
        user.setEmail("user@test.com");
        Picking picking = new Picking();
        picking.setId(3L);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(pickingRepository.findById(3L)).thenReturn(Optional.of(picking));
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> {
            Review saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        Review result = reviewService.createReview(3L, "user@test.com", 4, "Great place");

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(captor.capture());
        Review saved = captor.getValue();

        assertThat(saved.getRating()).isEqualTo(4);
        assertThat(saved.getComment()).isEqualTo("Great place");
        assertThat(saved.getUser()).isSameAs(user);
        assertThat(saved.getPicking()).isSameAs(picking);
        assertThat(saved.getPublishedAt()).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
    }

    @Test
    void updateReview_throwsWhenReviewNotFound() {
        User user = userWithEmail("user@test.com");
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(reviewRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.updateReview(1L, 99L, "user@test.com", 5, "Updated"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Review not found");
    }

    @Test
    void updateReview_throwsWhenPickingIdDoesNotMatch() {
        User user = userWithEmail("user@test.com");
        Review review = reviewForPicking(2L, 10L, user);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> reviewService.updateReview(1L, 10L, "user@test.com", 5, "Updated"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Review not found");
    }

    @Test
    void updateReview_forbiddenWhenNotOwner() {
        User owner = userWithEmail("owner@test.com");
        User other = userWithEmail("other@test.com");
        Review review = reviewForPicking(1L, 10L, owner);
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(other));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> reviewService.updateReview(1L, 10L, "other@test.com", 5, "Updated"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("own review");

        verify(reviewRepository, never()).save(any());
    }

    @Test
    void updateReview_updatesRatingAndCommentForOwner() {
        User user = userWithEmail("user@test.com");
        Review review = reviewForPicking(1L, 10L, user);
        review.setRating(2);
        review.setComment("Old");
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(review)).thenReturn(review);

        Review result = reviewService.updateReview(1L, 10L, "user@test.com", 5, "Updated");

        assertThat(result.getRating()).isEqualTo(5);
        assertThat(result.getComment()).isEqualTo("Updated");
        verify(reviewRepository).save(review);
    }

    @Test
    void deleteReview_throwsWhenReviewNotFound() {
        User user = userWithEmail("user@test.com");
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(reviewRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.deleteReview(1L, 99L, "user@test.com"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Review not found");

        verify(reviewRepository, never()).delete(any());
    }

    @Test
    void deleteReview_throwsWhenPickingIdDoesNotMatch() {
        User user = userWithEmail("user@test.com");
        Review review = reviewForPicking(2L, 10L, user);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> reviewService.deleteReview(1L, 10L, "user@test.com"))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Review not found");

        verify(reviewRepository, never()).delete(any());
    }

    @Test
    void deleteReview_forbiddenWhenNotOwner() {
        User owner = userWithEmail("owner@test.com");
        User other = userWithEmail("other@test.com");
        Review review = reviewForPicking(1L, 10L, owner);
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(other));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> reviewService.deleteReview(1L, 10L, "other@test.com"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("own review");

        verify(reviewRepository, never()).delete(any());
    }

    @Test
    void deleteReview_deletesWhenOwner() {
        User user = userWithEmail("user@test.com");
        Review review = reviewForPicking(1L, 10L, user);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));

        reviewService.deleteReview(1L, 10L, "user@test.com");

        verify(reviewRepository).delete(review);
    }

    private static User userWithEmail(String email) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(email);
        return user;
    }

    private static Review reviewForPicking(Long pickingId, Long reviewId, User user) {
        Picking picking = new Picking();
        picking.setId(pickingId);
        Review review = new Review();
        review.setId(reviewId);
        review.setPicking(picking);
        review.setUser(user);
        return review;
    }
}
