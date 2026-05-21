package com.cueillette.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int rating;

    private String comment;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "role", "email"})
    private User user;

    @ManyToOne
    @JoinColumn(name = "picking_id", nullable = false)
    @JsonIgnoreProperties({"products", "labels", "daysOpen", "producer"})
    private Picking picking;
}