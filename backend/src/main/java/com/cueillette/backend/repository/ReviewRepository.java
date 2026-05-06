package com.cueillette.backend.repository;

import com.cueillette.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByPickingIdOrderByPublishedAtDesc(Long pickingId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.picking.id = :pickingId")
    Double getAverageRatingByPickingId(Long pickingId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.picking.id = :pickingId")
    Long getReviewCountByPickingId(Long pickingId);
}
