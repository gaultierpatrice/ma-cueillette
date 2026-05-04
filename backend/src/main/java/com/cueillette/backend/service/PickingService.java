package com.cueillette.backend.service;

import com.cueillette.backend.model.Picking;
import com.cueillette.backend.repository.PickingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PickingService {

    private final PickingRepository pickingRepository;

    public PickingService(PickingRepository pickingRepository) {
        this.pickingRepository = pickingRepository;
    }

    public List<Picking> getAllPickings() {
        return pickingRepository.findAll();
    }
}
