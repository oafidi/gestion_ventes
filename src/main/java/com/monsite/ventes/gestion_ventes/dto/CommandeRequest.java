package com.monsite.ventes.gestion_ventes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommandeRequest {
    private String adresseLivraison;
    private String telephone;
    private String notes;
    private List<LigneCommandeRequest> lignesCommande;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LigneCommandeRequest {
        private Long vendeurProduitId;
        private Integer quantite;
        private BigDecimal prixUnitaire;
    }
}
