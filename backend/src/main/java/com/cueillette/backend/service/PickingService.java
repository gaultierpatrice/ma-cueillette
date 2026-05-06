package com.cueillette.backend.service;

import com.cueillette.backend.dto.PickingWithRatingDTO;
import com.cueillette.backend.model.Picking;
import com.cueillette.backend.repository.PickingRepository;
import com.cueillette.backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PickingService {

    private final PickingRepository pickingRepository;
    private final ReviewRepository reviewRepository;

    public PickingService(PickingRepository pickingRepository, ReviewRepository reviewRepository) {
        this.pickingRepository = pickingRepository;
        this.reviewRepository = reviewRepository;
    }

    public List<Picking> getAllPickings() {
        return pickingRepository.findAll();
    }

    public Optional<Picking> getPickingById(Long id) {
        return pickingRepository.findById(id);
    }

    public List<PickingWithRatingDTO> getAllPickingsWithRatings() {
        List<Picking> pickings = pickingRepository.findAll();
        return pickings.stream()
                .map(picking -> {
                    Double avgRating = reviewRepository.getAverageRatingByPickingId(picking.getId());
                    Long reviewCount = reviewRepository.getReviewCountByPickingId(picking.getId());
                    return new PickingWithRatingDTO(picking, avgRating, reviewCount);
                })
                .collect(Collectors.toList());
    }
}
