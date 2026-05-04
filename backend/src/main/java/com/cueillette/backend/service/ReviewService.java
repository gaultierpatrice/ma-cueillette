package com.cueillette.backend.service;

import com.cueillette.backend.model.Review;
import com.cueillette.backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public List<Review> getReviewsByPickingId(UUID pickingId) {
        return reviewRepository.findByPickingIdOrderByPublishedAtDesc(pickingId);
    }
}
