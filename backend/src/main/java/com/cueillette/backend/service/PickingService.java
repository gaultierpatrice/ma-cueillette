package com.cueillette.backend.service;

import com.cueillette.backend.dto.CreatePickingDTO;
import com.cueillette.backend.dto.PickingWithRatingDTO;
import com.cueillette.backend.dto.ProductDTO;
import com.cueillette.backend.dto.UpdatePickingDTO;
import com.cueillette.backend.exception.BadRequestException;
import com.cueillette.backend.exception.NotFoundException;
import com.cueillette.backend.model.Picking;
import com.cueillette.backend.model.Product;
import com.cueillette.backend.model.User;
import com.cueillette.backend.repository.PickingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
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

    private static final String DEFAULT_PICKING_IMAGE_URL = "/assets/images/illustration/strawberry.jpg";

    private final PickingRepository pickingRepository;
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final GeocodingService geocodingService;
    private final PickingImageStorageService pickingImageStorageService;

    public PickingService(
            PickingRepository pickingRepository,
            ReviewRepository reviewRepository,
            ProductRepository productRepository,
            GeocodingService geocodingService,
            PickingImageStorageService pickingImageStorageService) {
        this.pickingRepository = pickingRepository;
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.geocodingService = geocodingService;
        this.pickingImageStorageService = pickingImageStorageService;
    }

    public List<Picking> getAllPickings() {
        return pickingRepository.findAll();
    }

    public Optional<Picking> getPickingById(Long id) {
        return pickingRepository.findById(id);
    }

    public Optional<Picking> getPickingForProducer(User producer) {
        return pickingRepository.findFirstByProducer_IdOrderByIdAsc(producer.getId());
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
        picking.setPhoneSecondary(dto.getPhoneSecondary());
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

        if (dto.getLabels() != null && !dto.getLabels().isEmpty()) {
            picking.setLabels(new ArrayList<>(dto.getLabels()));
        }

        if (dto.getProducts() != null && !dto.getProducts().isEmpty()) {
            picking.setProducts(resolveProducts(dto.getProducts()));
        }

        applyProductionCategories(picking, dto);

        if (picking.getImageUrl() == null || picking.getImageUrl().isBlank()) {
            picking.setImageUrl(DEFAULT_PICKING_IMAGE_URL);
        }

        return pickingRepository.save(picking);
    }

    private void applyProductionCategories(Picking picking, CreatePickingDTO dto) {
        boolean hasFruits = dto.getCategories() != null && dto.getCategories().isFruits();
        boolean hasVegetables = dto.getCategories() != null && dto.getCategories().isVegetables();

        if (picking.getProducts() != null) {
            for (Product product : picking.getProducts()) {
                if (isFruitType(product.getType())) {
                    hasFruits = true;
                }
                if (isVegetableType(product.getType())) {
                    hasVegetables = true;
                }
            }
        }

        picking.setHasFruits(hasFruits);
        picking.setHasVegetables(hasVegetables);
    }

    private static boolean isFruitType(String type) {
        return type != null && type.trim().equalsIgnoreCase("fruit");
    }

    private static boolean isVegetableType(String type) {
        return type != null && type.trim().equalsIgnoreCase("vegetable");
    }

    @Transactional
    public Picking updatePicking(Long id, UpdatePickingDTO dto, User producer) {
        Picking picking = requireOwnedPicking(id, producer);

        String name = dto.getName() != null ? dto.getName().trim() : "";
        if (name.isEmpty()) {
            throw new BadRequestException("Picking name is required");
        }
        picking.setName(name);

        picking.setPhone(dto.getPhone());
        picking.setPhoneSecondary(dto.getPhoneSecondary());
        picking.setEmail(dto.getEmail());
        picking.setWebsite(dto.getWebsite());
        picking.setOpeningHours(dto.getOpeningHours());
        picking.setDescription(dto.getDescription());

        if (dto.getLabels() != null) {
            picking.setLabels(new ArrayList<>(dto.getLabels()));
        } else {
            picking.setLabels(new ArrayList<>());
        }

        if (dto.getProducts() != null) {
            picking.setProducts(dto.getProducts().isEmpty() ? new ArrayList<>() : resolveProducts(dto.getProducts()));
        } else {
            picking.setProducts(new ArrayList<>());
        }

        CreatePickingDTO categoriesSource = new CreatePickingDTO();
        categoriesSource.setCategories(dto.getCategories());
        applyProductionCategories(picking, categoriesSource);

        return pickingRepository.save(picking);
    }

    @Transactional
    public Picking updatePickingImage(Long id, MultipartFile file, User producer) {
        Picking picking = requireOwnedPicking(id, producer);
        String imageUrl = pickingImageStorageService.storePickingImage(id, file);
        picking.setImageUrl(imageUrl);
        return pickingRepository.save(picking);
    }

    private Picking requireOwnedPicking(Long id, User producer) {
        Picking picking = pickingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Picking not found"));

        if (picking.getProducer() == null || !picking.getProducer().getId().equals(producer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own picking");
        }
        return picking;
    }

    private List<Product> resolveProducts(List<ProductDTO> productDTOs) {
        List<Product> products = new ArrayList<>();
        for (ProductDTO productDTO : productDTOs) {
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
        return products;
    }

    @Transactional
    public boolean deletePicking(Long id) {
        if (!pickingRepository.existsById(id)) {
            return false;
        }
        pickingRepository.deleteById(id);
        return true;
    }
}
