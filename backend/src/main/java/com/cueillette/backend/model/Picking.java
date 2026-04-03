package com.cueillette.backend.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;

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
    @JoinColumn(name = "producer_id", nullable = false)
    private User producer;

    @ManyToMany
    @JoinTable(
            name = "picking_products",
            joinColumns = @JoinColumn(name = "picking_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private List<Product> products;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }
    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<DayOfWeek> getDaysOpen() { return daysOpen; }
    public void setDaysOpen(List<DayOfWeek> daysOpen) { this.daysOpen = daysOpen; }
    public List<Label> getLabels() { return labels; }
    public void setLabels(List<Label> labels) { this.labels = labels; }
    public User getProducer() { return producer; }
    public void setProducer(User producer) { this.producer = producer; }
    public List<Product> getProducts() { return products; }
    public void setProducts(List<Product> products) { this.products = products; }
}