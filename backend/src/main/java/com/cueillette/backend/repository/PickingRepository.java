package com.cueillette.backend.repository;

import com.cueillette.backend.model.Picking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PickingRepository extends JpaRepository<Picking, Long> {
}
