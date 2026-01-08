package com.monsite.ventes.gestion_ventes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PanierRequest {

    /**
     * Requête pour ajouter un produit au panier
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AjouterProduit {
        private Long vendeurProduitId;
        private Integer quantite;
        
        public Integer getQuantite() {
            return quantite != null ? quantite : 1;
        }
    }

    /**
     * Requête pour modifier la quantité d'un produit dans le panier
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModifierQuantite {
        private Long vendeurProduitId;
        private Integer quantite;
    }
}
