package com.cueillette.backend.dto;

import com.cueillette.backend.model.Label;
import lombok.Data;
import java.util.List;

@Data
public class CreatePickingDTO {
    private String name;
    private String address;
    private String postalCode;
    private String city;
    private String phone;
    private String phoneSecondary;
    private String email;
    private String website;
    private String openingHours;
    private String description;
    private Double lat;
    private Double lng;
    private CategoriesDTO categories;
    private List<ProductDTO> products;
    private List<Label> labels;

    @Data
    public static class CategoriesDTO {
        private boolean fruits;
        private boolean vegetables;
    }
}
