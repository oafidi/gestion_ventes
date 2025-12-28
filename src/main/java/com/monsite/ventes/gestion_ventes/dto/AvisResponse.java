package com.monsite.ventes.gestion_ventes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvisResponse {

    private Long id;
    private Long clientId;
    private String clientNom;
    private Long vendeurProduitId;
    private String produitTitre;
    private Integer note;
    private String commentaire;
    private LocalDateTime dateAvis;
    private Boolean estPositif;
    private Boolean estCache;
}
