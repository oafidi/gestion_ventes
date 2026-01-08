package com.monsite.ventes.gestion_ventes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PanierResponse {

    private Long id;
    private Long clientId;
    private String clientNom;
    private List<LignePanierResponse> lignesPanier;
    private BigDecimal montantTotal;
    private Integer nombreProduits;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LignePanierResponse {
        private Long id;
        private Long vendeurProduitId;
        private String produitNom;
        private String produitTitre;
        private String produitImage;
        private String vendeurNom;
        private Integer quantite;
        private BigDecimal prixUnitaire;
        private BigDecimal sousTotal;
        private Integer stockDisponible;
    }
}
