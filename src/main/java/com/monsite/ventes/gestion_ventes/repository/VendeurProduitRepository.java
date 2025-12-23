package com.monsite.ventes.gestion_ventes.repository;

import com.monsite.ventes.gestion_ventes.entity.VendeurProduit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendeurProduitRepository extends JpaRepository<VendeurProduit, Long> {
    List<VendeurProduit> findByVendeurId(Long vendeurId);
    List<VendeurProduit> findByProduitId(Long produitId);
    List<VendeurProduit> findByEstApprouve(boolean estApprouve);
    List<VendeurProduit> findByVendeurIdAndEstApprouve(Long vendeurId, boolean estApprouve);
    boolean existsByVendeurIdAndProduitId(Long vendeurId, Long produitId);
}
