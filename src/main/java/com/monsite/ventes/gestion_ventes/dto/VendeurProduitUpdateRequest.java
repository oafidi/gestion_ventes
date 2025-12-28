package com.monsite.ventes.gestion_ventes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendeurProduitUpdateRequest {

    @NotNull(message = "Le prix vendeur est obligatoire")
    @Positive(message = "Le prix doit être positif")
    private BigDecimal prixVendeur;

    private String image;

    private String description;

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;
}
