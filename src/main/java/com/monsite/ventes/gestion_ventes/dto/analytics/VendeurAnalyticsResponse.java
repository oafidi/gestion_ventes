package com.monsite.ventes.gestion_ventes.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO pour l'analyse des performances des vendeurs (ADMIN uniquement)
 * Contient les classements et statistiques par vendeur
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendeurAnalyticsResponse {
    
    // Liste des vendeurs avec leurs statistiques
    private List<VendeurStats> vendeurs;
    
    // Top vendeurs par performance
    private List<VendeurStats> topVendeurs;
    
    // Nombre total de vendeurs actifs
    private Long nombreVendeursActifs;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VendeurStats {
        private Long vendeurId;
        private String vendeurNom;
        private String email;
        private BigDecimal chiffreAffaires;
        private Long nombreVentes;
        private Long nombreProduits;
        private Long nombreProduitsApprouves;
        private Double noteMoyenne;
        private Long nombreReviews;
        private Double tauxConversion; // Produits vendus / Produits en stock
        private String performance; // TOP_PERFORMER, PERFORMANT, MOYEN, A_AMELIORER
        private Double tauxCroissance;
    }
}
