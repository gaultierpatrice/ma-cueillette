package com.cueillette.backend.controller;

import com.cueillette.backend.dto.PickingWithRatingDTO;
import com.cueillette.backend.model.Favorite;
import com.cueillette.backend.security.JwtUtil;
import com.cueillette.backend.service.FavoriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final JwtUtil jwtUtil;

    public FavoriteController(FavoriteService favoriteService, JwtUtil jwtUtil) {
        this.favoriteService = favoriteService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/{pickingId}")
    public ResponseEntity<Map<String, Object>> addFavorite(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long pickingId) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        Favorite favorite = favoriteService.addFavorite(email, pickingId);
        return ResponseEntity.ok(Map.of(
                "message", "Picking added to favorites",
                "favoriteId", favorite.getId()
        ));
    }

    @DeleteMapping("/{pickingId}")
    public ResponseEntity<Map<String, String>> removeFavorite(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long pickingId) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        favoriteService.removeFavorite(email, pickingId);
        return ResponseEntity.ok(Map.of("message", "Picking removed from favorites"));
    }

    @GetMapping
    public ResponseEntity<List<PickingWithRatingDTO>> getUserFavorites(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        List<PickingWithRatingDTO> favorites = favoriteService.getUserFavorites(email);
        return ResponseEntity.ok(favorites);
    }

    @GetMapping("/check/{pickingId}")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long pickingId) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);

        boolean isFavorite = favoriteService.isFavorite(email, pickingId);
        return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
    }
}
