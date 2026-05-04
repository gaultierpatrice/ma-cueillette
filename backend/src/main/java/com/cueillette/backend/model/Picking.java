package com.cueillette.backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "pickings")
public class Picking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String address;

    private Double lat;
    private Double lng;
    private String website;
    private String openingHours;
    private String description;
    private String name;
    private String postalCode;
    private String city;
    private String email;
    private String phone;
    private String imageUrl;

    @ElementCollection(targetClass = DayOfWeek.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "picking_days", joinColumns = @JoinColumn(name = "picking_id"))
    @Column(name = "day")
    private List<DayOfWeek> daysOpen;

    @ElementCollection(targetClass = Label.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "picking_labels", joinColumns = @JoinColumn(name = "picking_id"))
    @Column(name = "label")
    private List<Label> labels;

    @ManyToOne
    @JoinColumn(name = "producer_id", nullable = true)
    private User producer;

    @ManyToMany
    @JoinTable(
            name = "picking_products",
            joinColumns = @JoinColumn(name = "picking_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private List<Product> products;
}