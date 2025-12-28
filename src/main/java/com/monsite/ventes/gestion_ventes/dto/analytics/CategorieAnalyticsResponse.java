package com.monsite.ventes.gestion_ventes.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO pour l'analyse des performances par catégorie
 * Contient les statistiques de ventes et la répartition par catégorie
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorieAnalyticsResponse {
    
    // Liste des catégories avec leurs statistiques
    private List<CategorieStats> categories;
    
    // Chiffre d'affaires total (pour calculer les pourcentages)
    private BigDecimal chiffreAffairesTotal;
    
    // Nombre total de ventes
    private Long nombreTotalVentes;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorieStats {
        private Long categorieId;
        private String categorieNom;
        private String image;
        private BigDecimal chiffreAffaires;
        private Long nombreVentes;
        private Long nombreProduits;
        private BigDecimal prixMoyen;
        private Double noteMoyenne;
        private Double pourcentageCA; // Contribution au CA total (%)
        private Double pourcentageVentes; // Contribution aux ventes totales (%)
        private String performance; // FORT_POTENTIEL, PERFORMANT, STABLE, SOUS_EXPLOITE
        private Double tauxCroissance;
    }
}
