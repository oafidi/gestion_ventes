package com.monsite.ventes.gestion_ventes.repository;

import com.monsite.ventes.gestion_ventes.entity.Avis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {

    // Trouver tous les avis d'un produit vendeur (non cachés)
    @Query("SELECT a FROM Avis a JOIN FETCH a.client WHERE a.vendeurProduit.id = :vendeurProduitId AND a.estCache = false ORDER BY a.dateAvis DESC")
    List<Avis> findByVendeurProduitIdAndNotHidden(@Param("vendeurProduitId") Long vendeurProduitId);

    // Trouver tous les avis d'un produit vendeur (pour le vendeur)
    @Query("SELECT a FROM Avis a JOIN FETCH a.client WHERE a.vendeurProduit.id = :vendeurProduitId ORDER BY a.dateAvis DESC")
    List<Avis> findByVendeurProduitId(@Param("vendeurProduitId") Long vendeurProduitId);

    // Trouver tous les avis des produits d'un vendeur
    @Query("SELECT a FROM Avis a JOIN FETCH a.client JOIN FETCH a.vendeurProduit vp WHERE vp.vendeur.id = :vendeurId ORDER BY a.dateAvis DESC")
    List<Avis> findByVendeurId(@Param("vendeurId") Long vendeurId);

    // Trouver les avis d'un client
    @Query("SELECT a FROM Avis a JOIN FETCH a.vendeurProduit WHERE a.client.id = :clientId ORDER BY a.dateAvis DESC")
    List<Avis> findByClientId(@Param("clientId") Long clientId);

    // Vérifier si un client a déjà donné un avis sur un produit
    boolean existsByClientIdAndVendeurProduitId(Long clientId, Long vendeurProduitId);

    // Trouver un avis par client et produit
    Optional<Avis> findByClientIdAndVendeurProduitId(Long clientId, Long vendeurProduitId);

    // Calculer la moyenne des notes pour un produit
    @Query("SELECT AVG(a.note) FROM Avis a WHERE a.vendeurProduit.id = :vendeurProduitId AND a.estCache = false")
    Double getAverageNoteByVendeurProduitId(@Param("vendeurProduitId") Long vendeurProduitId);

    // Compter le nombre d'avis pour un produit
    @Query("SELECT COUNT(a) FROM Avis a WHERE a.vendeurProduit.id = :vendeurProduitId AND a.estCache = false")
    Long countByVendeurProduitId(@Param("vendeurProduitId") Long vendeurProduitId);
}
