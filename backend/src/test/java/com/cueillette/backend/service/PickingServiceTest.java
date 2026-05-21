package com.cueillette.backend.service;

import com.cueillette.backend.dto.CreatePickingDTO;
import com.cueillette.backend.dto.PickingWithRatingDTO;
import com.cueillette.backend.dto.ProductDTO;
import com.cueillette.backend.dto.UpdatePickingDTO;
import com.cueillette.backend.model.Label;
import com.cueillette.backend.model.Picking;
import com.cueillette.backend.model.Product;
import com.cueillette.backend.model.User;
import com.cueillette.backend.repository.PickingRepository;
import com.cueillette.backend.repository.ProductRepository;
import com.cueillette.backend.repository.ReviewRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class PickingServiceTest {

    @Mock
    private PickingRepository pickingRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private GeocodingService geocodingService;

    @Mock
    private PickingImageStorageService pickingImageStorageService;

    @InjectMocks
    private PickingService pickingService;

    @Test
    void getAllPickingsWithRatings_includesAverageRatingAndReviewCount() {
        Picking picking = new Picking();
        picking.setId(1L);
        picking.setName("Farm");
        picking.setAddress("1 rue");
        when(pickingRepository.findAll()).thenReturn(List.of(picking));
        when(reviewRepository.getAverageRatingByPickingId(1L)).thenReturn(4.2);
        when(reviewRepository.getReviewCountByPickingId(1L)).thenReturn(3L);

        List<PickingWithRatingDTO> result = pickingService.getAllPickingsWithRatings();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAverageRating()).isEqualTo(4.2);
        assertThat(result.get(0).getReviewCount()).isEqualTo(3L);
        assertThat(result.get(0).getName()).isEqualTo("Farm");
    }

    @Test
    void createPicking_usesCoordinatesFromDtoWhenProvided() {
        CreatePickingDTO dto = baseDto();
        dto.setLat(45.5);
        dto.setLng(-73.5);
        User producer = new User();

        when(pickingRepository.save(any(Picking.class))).thenAnswer(invocation -> {
            Picking saved = invocation.getArgument(0);
            saved.setId(10L);
            return saved;
        });

        Picking result = pickingService.createPicking(dto, producer);

        assertThat(result.getLat()).isEqualTo(45.5);
        assertThat(result.getLng()).isEqualTo(-73.5);
        verify(geocodingService, never()).geocodeAddress(any(), any(), any());
    }

    @Test
    void createPicking_geocodesAddressWhenCoordinatesMissing() {
        CreatePickingDTO dto = baseDto();
        User producer = new User();
        when(geocodingService.geocodeAddress("10 rue", "H1H1H1", "Montreal"))
                .thenReturn(new Double[]{45.0, -73.0});
        when(pickingRepository.save(any(Picking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Picking result = pickingService.createPicking(dto, producer);

        assertThat(result.getLat()).isEqualTo(45.0);
        assertThat(result.getLng()).isEqualTo(-73.0);
    }

    @Test
    void createPicking_setsDefaultImageAndLinksExistingProduct() {
        CreatePickingDTO dto = baseDto();
        dto.setLat(1.0);
        dto.setLng(2.0);
        ProductDTO productDTO = new ProductDTO();
        productDTO.setName("Tomato");
        productDTO.setType("vegetable");
        dto.setProducts(List.of(productDTO));

        Product existing = new Product();
        existing.setName("Tomato");
        existing.setType("vegetable");
        User producer = new User();

        when(productRepository.findByNameAndType("Tomato", "vegetable")).thenReturn(Optional.of(existing));
        when(pickingRepository.save(any(Picking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Picking result = pickingService.createPicking(dto, producer);

        assertThat(result.getImageUrl()).isEqualTo("/assets/images/illustration/strawberry.jpg");
        assertThat(result.getProducts()).containsExactly(existing);
        assertThat(result.getProducer()).isSameAs(producer);
        verify(productRepository, never()).save(any());
    }

    @Test
    void createPicking_persistsProductionCategoriesFromDto() {
        CreatePickingDTO dto = baseDto();
        dto.setLat(1.0);
        dto.setLng(2.0);
        CreatePickingDTO.CategoriesDTO categories = new CreatePickingDTO.CategoriesDTO();
        categories.setFruits(true);
        categories.setVegetables(true);
        dto.setCategories(categories);

        when(pickingRepository.save(any(Picking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Picking result = pickingService.createPicking(dto, new User());

        assertThat(result.isHasFruits()).isTrue();
        assertThat(result.isHasVegetables()).isTrue();
    }

    @Test
    void createPicking_allowsNoProductionCategorySelected() {
        CreatePickingDTO dto = baseDto();
        dto.setLat(1.0);
        dto.setLng(2.0);
        CreatePickingDTO.CategoriesDTO categories = new CreatePickingDTO.CategoriesDTO();
        dto.setCategories(categories);

        when(pickingRepository.save(any(Picking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Picking result = pickingService.createPicking(dto, new User());

        assertThat(result.isHasFruits()).isFalse();
        assertThat(result.isHasVegetables()).isFalse();
    }

    @Test
    void createPicking_persistsLabelsWhenProvided() {
        CreatePickingDTO dto = baseDto();
        dto.setLat(1.0);
        dto.setLng(2.0);
        dto.setLabels(List.of(Label.AB, Label.BIO_EUROPEEN));

        when(pickingRepository.save(any(Picking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Picking result = pickingService.createPicking(dto, new User());

        assertThat(result.getLabels()).containsExactly(Label.AB, Label.BIO_EUROPEEN);
    }

    @Test
    void createPicking_createsNewProductWhenNotFound() {
        CreatePickingDTO dto = baseDto();
        dto.setLat(1.0);
        dto.setLng(2.0);
        ProductDTO productDTO = new ProductDTO();
        productDTO.setName("Blueberry");
        productDTO.setType("fruit");
        productDTO.setHarvestSeason("summer");
        dto.setProducts(List.of(productDTO));

        when(productRepository.findByNameAndType("Blueberry", "fruit")).thenReturn(Optional.empty());
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(pickingRepository.save(any(Picking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Picking result = pickingService.createPicking(dto, new User());

        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(productCaptor.capture());
        assertThat(productCaptor.getValue().getName()).isEqualTo("Blueberry");
        assertThat(result.getProducts()).hasSize(1);
    }

    @Test
    void updatePicking_updatesEditableFieldsForOwner() {
        UUID producerId = UUID.randomUUID();
        User producer = new User();
        producer.setId(producerId);

        Picking picking = new Picking();
        picking.setId(3L);
        picking.setName("Farm");
        picking.setAddress("1 rue");
        picking.setProducer(producer);

        UpdatePickingDTO dto = new UpdatePickingDTO();
        dto.setName("Ferme du Soleil");
        dto.setPhone("01 23 45 67 89");
        dto.setEmail("farm@example.com");
        dto.setWebsite("https://farm.example");
        dto.setOpeningHours("Lun-Ven 9h-18h");
        dto.setDescription("Updated");
        dto.setLabels(List.of(Label.AB));
        CreatePickingDTO.CategoriesDTO categories = new CreatePickingDTO.CategoriesDTO();
        categories.setFruits(true);
        dto.setCategories(categories);

        when(pickingRepository.findById(3L)).thenReturn(Optional.of(picking));
        when(pickingRepository.save(any(Picking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Picking result = pickingService.updatePicking(3L, dto, producer);

        assertThat(result.getName()).isEqualTo("Ferme du Soleil");
        assertThat(result.getPhone()).isEqualTo("01 23 45 67 89");
        assertThat(result.getEmail()).isEqualTo("farm@example.com");
        assertThat(result.getWebsite()).isEqualTo("https://farm.example");
        assertThat(result.getOpeningHours()).isEqualTo("Lun-Ven 9h-18h");
        assertThat(result.getDescription()).isEqualTo("Updated");
        assertThat(result.getLabels()).containsExactly(Label.AB);
        assertThat(result.isHasFruits()).isTrue();
    }

    @Test
    void updatePicking_forbiddenWhenNotOwner() {
        User owner = new User();
        owner.setId(UUID.randomUUID());
        User other = new User();
        other.setId(UUID.randomUUID());

        Picking picking = new Picking();
        picking.setId(4L);
        picking.setProducer(owner);

        when(pickingRepository.findById(4L)).thenReturn(Optional.of(picking));

        assertThatThrownBy(() -> pickingService.updatePicking(4L, new UpdatePickingDTO(), other))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void deletePicking_returnsFalseWhenPickingDoesNotExist() {
        when(pickingRepository.existsById(99L)).thenReturn(false);

        assertThat(pickingService.deletePicking(99L)).isFalse();

        verify(pickingRepository, never()).deleteById(any());
    }

    @Test
    void deletePicking_deletesWhenPickingExists() {
        when(pickingRepository.existsById(5L)).thenReturn(true);

        assertThat(pickingService.deletePicking(5L)).isTrue();

        verify(pickingRepository).deleteById(5L);
    }

    private static CreatePickingDTO baseDto() {
        CreatePickingDTO dto = new CreatePickingDTO();
        dto.setName("Farm");
        dto.setAddress("10 rue");
        dto.setPostalCode("H1H1H1");
        dto.setCity("Montreal");
        CreatePickingDTO.CategoriesDTO categories = new CreatePickingDTO.CategoriesDTO();
        categories.setFruits(true);
        dto.setCategories(categories);
        return dto;
    }
}
