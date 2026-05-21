package com.cueillette.backend.dto;

import com.cueillette.backend.model.Label;
import lombok.Data;

import java.util.List;

@Data
public class UpdatePickingDTO {
    private String name;
    private String phone;
    private String phoneSecondary;
    private String email;
    private String website;
    private String openingHours;
    private String description;
    private CreatePickingDTO.CategoriesDTO categories;
    private List<ProductDTO> products;
    private List<Label> labels;
}
