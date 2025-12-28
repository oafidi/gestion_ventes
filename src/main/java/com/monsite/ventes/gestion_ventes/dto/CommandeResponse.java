package com.monsite.ventes.gestion_ventes.dto;

import com.monsite.ventes.gestion_ventes.entity.Commande.StatutCommande;
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
public class CommandeResponse {
    private Long id;
    private Long clientId;
    private String clientNom;
    private LocalDateTime dateCommande;
    private StatutCommande statut;
    private BigDecimal montantTotal;
    private String adresseLivraison;
    private List<LigneCommandeResponse> lignesCommande;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LigneCommandeResponse {
        private Long id;
        private Long vendeurProduitId;
        private VendeurProduitResponse vendeurProduit;
        private Integer quantite;
        private BigDecimal prixUnitaire;
        private BigDecimal sousTotal;
    }
}
