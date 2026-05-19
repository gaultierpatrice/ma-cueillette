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

import java.util.List;
import java.util.Optional;

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
    void deleteReview_returnsFalseWhenReviewNotFound() {
        when(reviewRepository.findById(99L)).thenReturn(Optional.empty());

        assertThat(reviewService.deleteReview(1L, 99L)).isFalse();

        verify(reviewRepository, never()).delete(any());
    }

    @Test
    void deleteReview_returnsFalseWhenPickingIdDoesNotMatch() {
        Review review = reviewForPicking(2L, 10L);
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));

        assertThat(reviewService.deleteReview(1L, 10L)).isFalse();

        verify(reviewRepository, never()).delete(any());
    }

    @Test
    void deleteReview_deletesWhenReviewBelongsToPicking() {
        Review review = reviewForPicking(1L, 10L);
        when(reviewRepository.findById(10L)).thenReturn(Optional.of(review));

        assertThat(reviewService.deleteReview(1L, 10L)).isTrue();

        verify(reviewRepository).delete(review);
    }

    private static Review reviewForPicking(Long pickingId, Long reviewId) {
        Picking picking = new Picking();
        picking.setId(pickingId);
        Review review = new Review();
        review.setId(reviewId);
        review.setPicking(picking);
        return review;
    }
}
