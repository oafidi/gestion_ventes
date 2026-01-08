package com.monsite.ventes.gestion_ventes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CsvImportResult {
    
    private boolean success;
    private String message;
    
    @Builder.Default
    private int totalLignes = 0;
    
    @Builder.Default
    private int commandesImportees = 0;
    
    @Builder.Default
    private int lignesCommandeImportees = 0;
    
    @Builder.Default
    private int doublonsIgnores = 0;
    
    @Builder.Default
    private int erreursCorrigees = 0;
    
    @Builder.Default
    private List<String> erreurs = new ArrayList<>();
    
    @Builder.Default
    private List<String> avertissements = new ArrayList<>();
    
    @Builder.Default
    private List<CommandeImportee> commandesDetails = new ArrayList<>();
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommandeImportee {
        private Long commandeId;
        private Long clientId;
        private String clientEmail;
        private int nbLignes;
        private String montantTotal;
        private String statut;
    }
}
