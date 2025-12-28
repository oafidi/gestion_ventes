package com.monsite.ventes.gestion_ventes.dto;

import com.monsite.ventes.gestion_ventes.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private Long id;
    private String nom;
    private String email;
    private String telephone;
    private Role role;
    private String message;
    private boolean success;
    private String token;

    // Pour les vendeurs
    private Boolean estApprouve;

    // Pour les clients
    private String adresseLivraison;
}
