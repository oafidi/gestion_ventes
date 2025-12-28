package com.monsite.ventes.gestion_ventes.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO pour l'analyse détaillée des produits
 * Contient les top produits, tableaux et statistiques par produit
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProduitAnalyticsResponse {
    
    // Top 10 produits par ventes
    private List<ProduitStats> top10ParVentes;
    
    // Top 10 produits par chiffre d'affaires
    private List<ProduitStats> top10ParCA;
    
    // Top 10 produits par note moyenne
    private List<ProduitStats> top10ParNote;
    
    // Tous les produits avec leurs statistiques (pour le tableau)
    private List<ProduitStats> tousLesProduits;
    
    // Nombre total de produits
    private Long nombreTotalProduits;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProduitStats {
        private Long vendeurProduitId;
        private String nomProduit;
        private String titre;
        private String image;
        private Long categorieId;
        private String categorieNom;
        private Long vendeurId;
        private String vendeurNom;
        private BigDecimal prixVendeur;
        private BigDecimal prixOriginal;
        private Long nombreVentes;
        private BigDecimal chiffreAffaires;
        private Double noteMoyenne;
        private Long nombreReviews;
        private Integer quantiteStock;
        private String statut; // EN_CROISSANCE, STABLE, EN_BAISSE
        private Double tauxCroissance;
        private Boolean estApprouve;
    }
}
