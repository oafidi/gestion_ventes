package com.monsite.ventes.gestion_ventes.repository;

import com.monsite.ventes.gestion_ventes.entity.LignePanier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LignePanierRepository extends JpaRepository<LignePanier, Long> {

    /**
     * Trouve toutes les lignes d'un panier
     */
    List<LignePanier> findByPanierId(Long panierId);

    /**
     * Trouve une ligne de panier par panier et vendeurProduit
     */
    Optional<LignePanier> findByPanierIdAndVendeurProduitId(Long panierId, Long vendeurProduitId);

    /**
     * Supprime toutes les lignes d'un panier
     */
    void deleteByPanierId(Long panierId);

    /**
     * Vérifie si un produit existe déjà dans le panier
     */
    boolean existsByPanierIdAndVendeurProduitId(Long panierId, Long vendeurProduitId);
}
