package com.cueillette.backend.controller;

import com.cueillette.backend.dto.PickingWithRatingDTO;
import com.cueillette.backend.model.Favorite;
import com.cueillette.backend.security.JwtUtil;
import com.cueillette.backend.service.FavoriteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final JwtUtil jwtUtil;

    public FavoriteController(FavoriteService favoriteService, JwtUtil jwtUtil) {
        this.favoriteService = favoriteService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/{pickingId}")
    public ResponseEntity<?> addFavorite(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long pickingId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);

            Favorite favorite = favoriteService.addFavorite(email, pickingId);
            return ResponseEntity.ok(Map.of(
                "message", "Picking added to favorites",
                "favoriteId", favorite.getId()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{pickingId}")
    public ResponseEntity<?> removeFavorite(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long pickingId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);

            favoriteService.removeFavorite(email, pickingId);
            return ResponseEntity.ok(Map.of("message", "Picking removed from favorites"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserFavorites(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);

            List<PickingWithRatingDTO> favorites = favoriteService.getUserFavorites(email);
            return ResponseEntity.ok(favorites);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/check/{pickingId}")
    public ResponseEntity<?> checkFavorite(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long pickingId) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String email = jwtUtil.extractEmail(token);

            boolean isFavorite = favoriteService.isFavorite(email, pickingId);
            return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
