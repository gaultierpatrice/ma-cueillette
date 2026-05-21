package com.cueillette.backend.controller;

import com.cueillette.backend.model.Review;
import com.cueillette.backend.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pickings/{pickingId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<List<Review>> getReviewsByPickingId(@PathVariable Long pickingId) {
        List<Review> reviews = reviewService.getReviewsByPickingId(pickingId);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    public ResponseEntity<Review> createReview(
            @PathVariable Long pickingId,
            @RequestBody ReviewRequest reviewRequest,
            @AuthenticationPrincipal String userEmail) {
        Review review = reviewService.createReview(pickingId, userEmail, reviewRequest.getRating(), reviewRequest.getComment());
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<Review> updateReview(
            @PathVariable Long pickingId,
            @PathVariable Long reviewId,
            @RequestBody ReviewRequest reviewRequest,
            @AuthenticationPrincipal String userEmail) {
        Review review = reviewService.updateReview(
                pickingId, reviewId, userEmail, reviewRequest.getRating(), reviewRequest.getComment());
        return ResponseEntity.ok(review);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long pickingId,
            @PathVariable Long reviewId,
            @AuthenticationPrincipal String userEmail) {
        reviewService.deleteReview(pickingId, reviewId, userEmail);
        return ResponseEntity.noContent().build();
    }

    public static class ReviewRequest {
        private int rating;
        private String comment;

        public int getRating() {
            return rating;
        }

        public void setRating(int rating) {
            this.rating = rating;
        }

        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }
    }
}
