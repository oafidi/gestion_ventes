package com.monsite.ventes.gestion_ventes.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO pour les données de tendances de ventes dans le temps
 * Utilisé pour les graphiques de courbes et d'évolution
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VentesTendanceResponse {
    
    // Données de ventes par période
    private List<PointVente> pointsVente;
    
    // Données de comparaison (période précédente)
    private List<PointVente> pointsVenteComparaison;
    
    // Statistiques globales de la période
    private BigDecimal totalVentes;
    private Long nombreCommandes;
    private BigDecimal moyenneParPeriode;
    
    // Période analysée
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String typePeriode; // JOUR, SEMAINE, MOIS
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PointVente {
        private String periode; // Label de la période (ex: "Jan 2024", "Semaine 1", "01/01/2024")
        private LocalDate date;
        private BigDecimal chiffreAffaires;
        private Long nombreVentes;
        private Long nombreProduits;
    }
}
