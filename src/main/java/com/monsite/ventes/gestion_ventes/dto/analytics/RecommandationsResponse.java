package com.monsite.ventes.gestion_ventes.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO pour les recommandations et insights intelligents
 * Contient les analyses automatiques et suggestions d'amélioration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommandationsResponse {
    
    // Insights générés automatiquement
    private List<Insight> insights;
    
    // Opportunités détectées
    private List<Opportunite> opportunites;
    
    // Alertes et avertissements
    private List<Alerte> alertes;
    
    // Produits à fort potentiel (bien notés mais peu vendus)
    private List<ProduitPotentiel> produitsFortPotentiel;
    
    // Produits à améliorer (vendus mais mal notés)
    private List<ProduitAmeliorer> produitsAAmeliorer;
    
    // Catégories tendance
    private List<CategorieTendance> categoriesTendance;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Insight {
        private String type; // INFO, SUCCESS, WARNING, OPPORTUNITY
        private String titre;
        private String message;
        private String icone;
        private String action; // Action suggérée
        private String lien; // Lien vers la page concernée
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Opportunite {
        private String type; // MARKETING, PRIX, NOUVEAU_PRODUIT, CATEGORIE
        private String titre;
        private String description;
        private BigDecimal potentielEstime; // Estimation du gain potentiel
        private String priorite; // HAUTE, MOYENNE, BASSE
        private List<Long> produitsIds; // Produits concernés
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Alerte {
        private String type; // BAISSE_VENTES, STOCK_FAIBLE, MAUVAISES_NOTES, PERFORMANCE
        private String titre;
        private String message;
        private String severite; // CRITIQUE, AVERTISSEMENT, INFO
        private Long elementId; // ID du produit/vendeur concerné
        private String elementType; // PRODUIT, VENDEUR, CATEGORIE
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProduitPotentiel {
        private Long vendeurProduitId;
        private String nomProduit;
        private String categorie;
        private Double noteMoyenne;
        private Long nombreReviews;
        private Long nombreVentes;
        private String raison; // Explication du potentiel
        private String suggestion; // Action recommandée
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProduitAmeliorer {
        private Long vendeurProduitId;
        private String nomProduit;
        private String categorie;
        private Double noteMoyenne;
        private Long nombreVentes;
        private String probleme; // Description du problème
        private String suggestion; // Action recommandée
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorieTendance {
        private Long categorieId;
        private String categorieNom;
        private Double tauxCroissance;
        private String tendance; // EN_HAUSSE, STABLE, EN_BAISSE
        private String opportunite; // Description de l'opportunité
    }
}
