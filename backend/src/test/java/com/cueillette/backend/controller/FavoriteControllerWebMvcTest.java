package com.cueillette.backend.controller;

import com.cueillette.backend.dto.PickingWithRatingDTO;
import com.cueillette.backend.exception.ConflictException;
import com.cueillette.backend.exception.NotFoundException;
import com.cueillette.backend.exception.RestExceptionHandler;
import com.cueillette.backend.model.Favorite;
import com.cueillette.backend.model.Picking;
import com.cueillette.backend.security.JwtUtil;
import com.cueillette.backend.service.FavoriteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = FavoriteController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(RestExceptionHandler.class)
class FavoriteControllerWebMvcTest {

    private static final String AUTH_HEADER = "Bearer test-jwt";
    private static final String USER_EMAIL = "user@example.com";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FavoriteService favoriteService;

    @MockBean
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        when(jwtUtil.extractEmail("test-jwt")).thenReturn(USER_EMAIL);
    }

    @Test
    void addFavoriteReturnsMessageAndFavoriteId() throws Exception {
        Favorite favorite = new Favorite();
        favorite.setId(42L);
        when(favoriteService.addFavorite(USER_EMAIL, 5L)).thenReturn(favorite);

        mockMvc.perform(post("/api/favorites/5").header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Picking added to favorites"))
                .andExpect(jsonPath("$.favoriteId").value(42));
    }

    @Test
    void addFavoriteConflictReturnsApiError() throws Exception {
        when(favoriteService.addFavorite(USER_EMAIL, 5L))
                .thenThrow(new ConflictException("Picking already in favorites"));

        mockMvc.perform(post("/api/favorites/5").header("Authorization", AUTH_HEADER))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Picking already in favorites"))
                .andExpect(jsonPath("$.path").value("/api/favorites/5"));
    }

    @Test
    void addFavoriteNotFoundReturnsApiError() throws Exception {
        when(favoriteService.addFavorite(USER_EMAIL, 99L))
                .thenThrow(new NotFoundException("Picking not found"));

        mockMvc.perform(post("/api/favorites/99").header("Authorization", AUTH_HEADER))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Picking not found"));
    }

    @Test
    void removeFavoriteReturnsSuccessMessage() throws Exception {
        mockMvc.perform(delete("/api/favorites/5").header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Picking removed from favorites"));
    }

    @Test
    void getUserFavoritesReturnsJsonArray() throws Exception {
        Picking picking = new Picking();
        picking.setId(1L);
        picking.setName("Farm");
        picking.setAddress("1 rue");
        PickingWithRatingDTO dto = new PickingWithRatingDTO(picking, 4.5, 2L);
        when(favoriteService.getUserFavorites(USER_EMAIL)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/favorites").header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Farm"))
                .andExpect(jsonPath("$[0].averageRating").value(4.5))
                .andExpect(jsonPath("$[0].reviewCount").value(2));
    }

    @Test
    void checkFavoriteReturnsBooleanFlag() throws Exception {
        when(favoriteService.isFavorite(USER_EMAIL, 7L)).thenReturn(true);

        mockMvc.perform(get("/api/favorites/check/7").header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isFavorite").value(true));
    }
}
