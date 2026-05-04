package com.cueillette.backend.controller;

import com.cueillette.backend.model.Picking;
import com.cueillette.backend.service.PickingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pickings")
@CrossOrigin(origins = "*")
public class PickingController {

    private final PickingService pickingService;

    public PickingController(PickingService pickingService) {
        this.pickingService = pickingService;
    }

    @GetMapping
    public ResponseEntity<List<Picking>> getAllPickings() {
        List<Picking> pickings = pickingService.getAllPickings();
        return ResponseEntity.ok(pickings);
    }
}
