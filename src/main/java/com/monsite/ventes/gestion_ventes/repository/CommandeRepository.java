package com.monsite.ventes.gestion_ventes.repository;

import com.monsite.ventes.gestion_ventes.entity.Commande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {
    List<Commande> findByClientId(Long clientId);
    List<Commande> findByStatut(Commande.StatutCommande statut);
}
