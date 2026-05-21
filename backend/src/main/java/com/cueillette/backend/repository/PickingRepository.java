package com.cueillette.backend.repository;

import com.cueillette.backend.model.Picking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PickingRepository extends JpaRepository<Picking, Long> {

    Optional<Picking> findFirstByProducer_IdOrderByIdAsc(UUID producerId);
}
