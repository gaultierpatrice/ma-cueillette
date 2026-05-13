package com.cueillette.backend.dto;

import com.cueillette.backend.model.*;
import lombok.Data;

import java.util.List;

@Data
public class PickingWithRatingDTO {
    private Long id;
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
    private String phoneSecondary;
    private String imageUrl;
    private List<DayOfWeek> daysOpen;
    private List<Label> labels;
    private List<Product> products;
    private Double averageRating;
    private Long reviewCount;

    public PickingWithRatingDTO(Picking picking, Double averageRating, Long reviewCount) {
        this.id = picking.getId();
        this.address = picking.getAddress();
        this.lat = picking.getLat();
        this.lng = picking.getLng();
        this.website = picking.getWebsite();
        this.openingHours = picking.getOpeningHours();
        this.description = picking.getDescription();
        this.name = picking.getName();
        this.postalCode = picking.getPostalCode();
        this.city = picking.getCity();
        this.email = picking.getEmail();
        this.phone = picking.getPhone();
        this.phoneSecondary = picking.getPhoneSecondary();
        this.imageUrl = picking.getImageUrl();
        this.daysOpen = picking.getDaysOpen();
        this.labels = picking.getLabels();
        this.products = picking.getProducts();
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }
}
