package com.monsite.ventes.gestion_ventes.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO pour les filtres de recherche du dashboard analytics
 * Permet de filtrer les données par différents critères
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsFilterRequest {
    
    // Filtre par date
    private LocalDate dateDebut;
    private LocalDate dateFin;
    
    // Filtre par catégorie
    private Long categorieId;
    
    // Filtre par vendeur (ADMIN uniquement)
    private Long vendeurId;
    
    // Filtre par prix
    private BigDecimal prixMin;
    private BigDecimal prixMax;
    
    // Filtre par note
    private Double noteMinimale;
    
    // Filtre par nombre de reviews
    private Long nombreReviewsMin;
    
    // Type de période pour les tendances
    private String typePeriode; // JOUR, SEMAINE, MOIS
    
    // Tri
    private String triPar; // VENTES, CA, NOTE, PRIX, NOM
    private String ordreTriger; // ASC, DESC
    
    // Pagination
    private Integer page;
    private Integer taille;
    
    // Statut du produit
    private Boolean estApprouve;
    
    // Recherche textuelle
    private String recherche;
}
