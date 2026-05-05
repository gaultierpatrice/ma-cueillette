package com.cueillette.backend.repository;

import com.cueillette.backend.model.Favorite;
import com.cueillette.backend.model.Picking;
import com.cueillette.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, UUID> {
    
    List<Favorite> findByUser(User user);
    
    Optional<Favorite> findByUserAndPicking(User user, Picking picking);
    
    boolean existsByUserAndPicking(User user, Picking picking);
    
    @Modifying
    void deleteByUserAndPicking(User user, Picking picking);
}
