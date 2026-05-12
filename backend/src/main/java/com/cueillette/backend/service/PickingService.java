package com.cueillette.backend.service;

import com.cueillette.backend.dto.CreatePickingDTO;
import com.cueillette.backend.dto.PickingWithRatingDTO;
import com.cueillette.backend.dto.ProductDTO;
import com.cueillette.backend.model.Picking;
import com.cueillette.backend.model.Product;
import com.cueillette.backend.model.User;
import com.cueillette.backend.repository.PickingRepository;
import com.cueillette.backend.repository.ProductRepository;
import com.cueillette.backend.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PickingService {

    private final PickingRepository pickingRepository;
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final GeocodingService geocodingService;

    public PickingService(PickingRepository pickingRepository, ReviewRepository reviewRepository, 
                         ProductRepository productRepository, GeocodingService geocodingService) {
        this.pickingRepository = pickingRepository;
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.geocodingService = geocodingService;
    }

    public List<Picking> getAllPickings() {
        return pickingRepository.findAll();
    }

    public Optional<Picking> getPickingById(Long id) {
        return pickingRepository.findById(id);
    }

    public List<PickingWithRatingDTO> getAllPickingsWithRatings() {
        List<Picking> pickings = pickingRepository.findAll();
        return pickings.stream()
                .map(picking -> {
                    Double avgRating = reviewRepository.getAverageRatingByPickingId(picking.getId());
                    Long reviewCount = reviewRepository.getReviewCountByPickingId(picking.getId());
                    return new PickingWithRatingDTO(picking, avgRating, reviewCount);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public Picking createPicking(CreatePickingDTO dto, User producer) {
        Picking picking = new Picking();
        picking.setName(dto.getName());
        picking.setAddress(dto.getAddress());
        picking.setPostalCode(dto.getPostalCode());
        picking.setCity(dto.getCity());
        picking.setPhone(dto.getPhone());
        picking.setEmail(dto.getEmail());
        picking.setWebsite(dto.getWebsite());
        picking.setOpeningHours(dto.getOpeningHours());
        picking.setDescription(dto.getDescription());
        picking.setProducer(producer);

        if (dto.getLat() != null && dto.getLng() != null) {
            picking.setLat(dto.getLat());
            picking.setLng(dto.getLng());
        } else {
            Double[] coordinates = geocodingService.geocodeAddress(
                dto.getAddress(), 
                dto.getPostalCode(), 
                dto.getCity()
            );
            
            if (coordinates != null) {
                picking.setLat(coordinates[0]);
                picking.setLng(coordinates[1]);
            }
        }

        if (dto.getProducts() != null && !dto.getProducts().isEmpty()) {
            List<Product> products = new ArrayList<>();
            for (ProductDTO productDTO : dto.getProducts()) {
                Product product = productRepository
                        .findByNameAndType(productDTO.getName(), productDTO.getType())
                        .orElseGet(() -> {
                            Product newProduct = new Product();
                            newProduct.setName(productDTO.getName());
                            newProduct.setType(productDTO.getType());
                            newProduct.setHarvestSeason(productDTO.getHarvestSeason());
                            return productRepository.save(newProduct);
                        });
                products.add(product);
            }
            picking.setProducts(products);
        }

        return pickingRepository.save(picking);
    }
}
