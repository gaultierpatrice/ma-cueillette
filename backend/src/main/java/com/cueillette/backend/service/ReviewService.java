package com.cueillette.backend.service;

import com.cueillette.backend.exception.NotFoundException;
import com.cueillette.backend.model.Picking;
import com.cueillette.backend.model.Review;
import com.cueillette.backend.model.User;
import com.cueillette.backend.repository.PickingRepository;
import com.cueillette.backend.repository.ReviewRepository;
import com.cueillette.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final PickingRepository pickingRepository;

    public ReviewService(ReviewRepository reviewRepository, UserRepository userRepository, PickingRepository pickingRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.pickingRepository = pickingRepository;
    }

    public List<Review> getReviewsByPickingId(Long pickingId) {
        return reviewRepository.findByPickingIdOrderByPublishedAtDesc(pickingId);
    }

    public Review createReview(Long pickingId, String userEmail, int rating, String comment) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Picking picking = pickingRepository.findById(pickingId)
                .orElseThrow(() -> new NotFoundException("Picking not found"));

        Review review = new Review();
        review.setRating(rating);
        review.setComment(comment);
        review.setPublishedAt(LocalDateTime.now());
        review.setUser(user);
        review.setPicking(picking);

        return reviewRepository.save(review);
    }

    @Transactional
    public boolean deleteReview(Long pickingId, Long reviewId) {
        return reviewRepository.findById(reviewId)
                .filter(review -> review.getPicking().getId().equals(pickingId))
                .map(review -> {
                    reviewRepository.delete(review);
                    return true;
                })
                .orElse(false);
    }
}
