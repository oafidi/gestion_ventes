package com.monsite.ventes.gestion_ventes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendeurProduitResponse {

    private Long id;
    private Long vendeurId;
    private String vendeurNom;
    private Long produitId;
    private String produitNom;
    private BigDecimal prixOriginal;
    private BigDecimal prixVendeur;
    private String image;
    private String description;
    private String titre;
    private boolean estApprouve;
    private String categorieNom;
}
