package com.cueillette.backend.controller;

import com.cueillette.backend.model.Review;
import com.cueillette.backend.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pickings/{pickingId}/reviews")
@CrossOrigin(origins = "*")
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
}
