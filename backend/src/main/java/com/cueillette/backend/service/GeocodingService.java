package com.cueillette.backend.service;

import com.cueillette.backend.dto.GeocodingResultDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class GeocodingService {
    
    private static final Logger logger = LoggerFactory.getLogger(GeocodingService.class);
    private static final String NOMINATIM_API_URL = "https://nominatim.openstreetmap.org/search";
    
    private final RestTemplate restTemplate;
    
    public GeocodingService() {
        this.restTemplate = new RestTemplate();
    }
    
    public Double[] geocodeAddress(String address, String postalCode, String city) {
        try {
            String fullAddress = String.format("%s, %s %s", address, postalCode, city);
            
            String url = UriComponentsBuilder.fromHttpUrl(NOMINATIM_API_URL)
                    .queryParam("format", "json")
                    .queryParam("q", fullAddress)
                    .queryParam("limit", "1")
                    .queryParam("addressdetails", "1")
                    .toUriString();
            
            logger.info("Geocoding address: {}", fullAddress);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "MaCueilletteApp/1.0 (gaultierpatricetechson@gmail.com)");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<GeocodingResultDTO[]> response = restTemplate.exchange(
                url, 
                HttpMethod.GET, 
                entity, 
                GeocodingResultDTO[].class
            );
            
            GeocodingResultDTO[] results = response.getBody();
            
            if (results != null && results.length > 0) {
                GeocodingResultDTO result = results[0];
                Double lat = Double.parseDouble(result.getLat());
                Double lng = Double.parseDouble(result.getLon());
                logger.info("Geocoding successful: lat={}, lng={}", lat, lng);
                return new Double[]{lat, lng};
            } else {
                logger.warn("No geocoding results found for address: {}", fullAddress);
                return null;
            }
            
        } catch (Exception e) {
            logger.error("Error geocoding address: {}", e.getMessage());
            return null;
        }
    }
}
