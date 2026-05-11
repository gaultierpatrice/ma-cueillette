package com.cueillette.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreatePickingDTO {
    private String name;
    private String address;
    private String postalCode;
    private String city;
    private String phone;
    private String email;
    private String website;
    private String openingHours;
    private String description;
    private CategoriesDTO categories;
    private List<ProductDTO> products;

    @Data
    public static class CategoriesDTO {
        private boolean fruits;
        private boolean vegetables;
    }
}
