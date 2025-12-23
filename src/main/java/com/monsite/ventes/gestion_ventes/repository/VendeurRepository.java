package com.monsite.ventes.gestion_ventes.repository;

import com.monsite.ventes.gestion_ventes.entity.Vendeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendeurRepository extends JpaRepository<Vendeur, Long> {
    Optional<Vendeur> findByEmail(String email);
    List<Vendeur> findByEstApprouve(boolean estApprouve);
}
