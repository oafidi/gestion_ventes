package com.monsite.ventes.gestion_ventes.repository;

import com.monsite.ventes.gestion_ventes.entity.Panier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PanierRepository extends JpaRepository<Panier, Long> {

    /**
     * Trouve le panier d'un client par son ID
     */
    Optional<Panier> findByClientId(Long clientId);

    /**
     * Trouve le panier d'un client avec ses lignes de panier
     */
    @Query("SELECT p FROM Panier p LEFT JOIN FETCH p.lignesPanier lp LEFT JOIN FETCH lp.vendeurProduit vp LEFT JOIN FETCH vp.produit WHERE p.client.id = :clientId")
    Optional<Panier> findByClientIdWithDetails(@Param("clientId") Long clientId);

    /**
     * Vérifie si un client a déjà un panier
     */
    boolean existsByClientId(Long clientId);
}
