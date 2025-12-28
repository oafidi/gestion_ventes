package com.monsite.ventes.gestion_ventes.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO pour les indicateurs clés de performance (KPI) du dashboard
 * Contient les métriques principales affichées en haut du dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardKPIResponse {
    
    // Chiffre d'affaires total
    private BigDecimal chiffreAffairesTotal;
    
    // Nombre total de ventes (commandes)
    private Long nombreTotalVentes;
    
    // Nombre total de produits vendus (quantité)
    private Long nombreProduitsVendus;
    
    // Prix moyen par commande
    private BigDecimal prixMoyenCommande;
    
    // Produit le plus vendu
    private ProduitPerformance produitPlusVendu;
    
    // Produit le mieux noté
    private ProduitPerformance produitMieuxNote;
    
    // Taux de croissance des ventes (%)
    private Double tauxCroissanceVentes;
    
    // Nombre total de reviews
    private Long nombreTotalReviews;
    
    // Note moyenne globale
    private Double noteMoyenneGlobale;
    
    // Nombre de commandes par statut
    private Long commandesEnAttente;
    private Long commandesConfirmees;
    private Long commandesLivrees;
    private Long commandesAnnulees;
    
    // Période de comparaison
    private BigDecimal chiffreAffairesPeriodePrecedente;
    private Long nombreVentesPeriodePrecedente;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProduitPerformance {
        private Long vendeurProduitId;
        private String nomProduit;
        private String categorie;
        private Long nombreVentes;
        private BigDecimal chiffreAffaires;
        private Double noteMoyenne;
        private Long nombreReviews;
        private String image;
        private String vendeurNom;
    }
}
