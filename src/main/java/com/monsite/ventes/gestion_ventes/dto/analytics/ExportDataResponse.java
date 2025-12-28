package com.monsite.ventes.gestion_ventes.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO pour l'export des données du dashboard
 * Contient toutes les données filtrées prêtes à être exportées
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportDataResponse {
    
    // Métadonnées de l'export
    private LocalDateTime dateExport;
    private String typeExport; // CSV, EXCEL
    private String roleUtilisateur; // ADMIN, VENDEUR
    private Long utilisateurId;
    
    // Filtres appliqués
    private AnalyticsFilterRequest filtresAppliques;
    
    // Données KPI
    private DashboardKPIResponse kpis;
    
    // Données des produits
    private List<ProduitAnalyticsResponse.ProduitStats> produits;
    
    // Données des catégories
    private List<CategorieAnalyticsResponse.CategorieStats> categories;
    
    // Résumé analytique textuel
    private String resumeAnalytique;
}
