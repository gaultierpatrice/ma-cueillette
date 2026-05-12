package com.cueillette.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class GeocodingResultDTO {
    @JsonProperty("lat")
    private String lat;
    
    @JsonProperty("lon")
    private String lon;
    
    @JsonProperty("display_name")
    private String displayName;
}
