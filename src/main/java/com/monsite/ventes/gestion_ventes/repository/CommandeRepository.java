package com.monsite.ventes.gestion_ventes.repository;

import com.monsite.ventes.gestion_ventes.entity.Commande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {
    List<Commande> findByClientId(Long clientId);
    List<Commande> findByStatut(Commande.StatutCommande statut);
    boolean existsByClientId(Long clientId);
    
    @Query("SELECT DISTINCT c FROM Commande c " +
           "LEFT JOIN FETCH c.client " +
           "LEFT JOIN FETCH c.lignesCommande lc " +
           "LEFT JOIN FETCH lc.vendeurProduit vp " +
           "LEFT JOIN FETCH vp.vendeur " +
           "LEFT JOIN FETCH vp.produit p " +
           "LEFT JOIN FETCH p.categorie " +
           "WHERE c.id = :id")
    Optional<Commande> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT DISTINCT c FROM Commande c " +
           "LEFT JOIN FETCH c.client " +
           "LEFT JOIN FETCH c.lignesCommande lc " +
           "LEFT JOIN FETCH lc.vendeurProduit vp " +
           "LEFT JOIN FETCH vp.vendeur " +
           "LEFT JOIN FETCH vp.produit p " +
           "LEFT JOIN FETCH p.categorie " +
           "WHERE c.client.id = :clientId")
    List<Commande> findByClientIdWithDetails(@Param("clientId") Long clientId);
    
    @Query("SELECT DISTINCT c FROM Commande c " +
           "LEFT JOIN FETCH c.client " +
           "LEFT JOIN FETCH c.lignesCommande lc " +
           "LEFT JOIN FETCH lc.vendeurProduit vp " +
           "LEFT JOIN FETCH vp.vendeur " +
           "LEFT JOIN FETCH vp.produit p " +
           "LEFT JOIN FETCH p.categorie")
    List<Commande> findAllWithDetails();
}
