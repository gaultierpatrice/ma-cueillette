package com.cueillette.backend.service;

import com.cueillette.backend.exception.NotFoundException;
import com.cueillette.backend.model.Picking;
import com.cueillette.backend.model.Review;
import com.cueillette.backend.model.User;
import com.cueillette.backend.repository.PickingRepository;
import com.cueillette.backend.repository.ReviewRepository;
import com.cueillette.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
        User user = requireUser(userEmail);

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
    public Review updateReview(Long pickingId, Long reviewId, String userEmail, int rating, String comment) {
        User user = requireUser(userEmail);
        Review review = requireOwnedReview(pickingId, reviewId, user);
        review.setRating(rating);
        review.setComment(comment);
        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(Long pickingId, Long reviewId, String userEmail) {
        User user = requireUser(userEmail);
        Review review = requireOwnedReview(pickingId, reviewId, user);
        reviewRepository.delete(review);
    }

    private User requireUser(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private Review requireOwnedReview(Long pickingId, Long reviewId, User user) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("Review not found"));

        if (!review.getPicking().getId().equals(pickingId)) {
            throw new NotFoundException("Review not found");
        }

        if (!review.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only modify your own review");
        }

        return review;
    }
}
