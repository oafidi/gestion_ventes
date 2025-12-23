package com.monsite.ventes.gestion_ventes.repository;

import com.monsite.ventes.gestion_ventes.entity.Avis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {
    List<Avis> findByClientId(Long clientId);
    List<Avis> findByVendeurProduitId(Long vendeurProduitId);
}
