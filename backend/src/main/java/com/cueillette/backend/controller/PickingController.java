package com.cueillette.backend.controller;

import com.cueillette.backend.dto.CreatePickingDTO;
import com.cueillette.backend.dto.PickingWithRatingDTO;
import com.cueillette.backend.exception.NotFoundException;
import com.cueillette.backend.model.Picking;
import com.cueillette.backend.model.User;
import com.cueillette.backend.repository.UserRepository;
import com.cueillette.backend.service.PickingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pickings")
public class PickingController {

    private final PickingService pickingService;
    private final UserRepository userRepository;

    public PickingController(PickingService pickingService, UserRepository userRepository) {
        this.pickingService = pickingService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<PickingWithRatingDTO>> getAllPickings() {
        List<PickingWithRatingDTO> pickings = pickingService.getAllPickingsWithRatings();
        return ResponseEntity.ok(pickings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Picking> getPickingById(@PathVariable Long id) {
        return pickingService.getPickingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPicking(
            @RequestBody CreatePickingDTO createPickingDTO,
            Authentication authentication) {
        String userEmail = authentication.getName();
        User producer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Picking picking = pickingService.createPicking(createPickingDTO, producer);
        return ResponseEntity.status(HttpStatus.CREATED).body(picking);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePicking(@PathVariable Long id) {
        if (!pickingService.deletePicking(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
