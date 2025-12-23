package com.monsite.ventes.gestion_ventes.controller;

import com.monsite.ventes.gestion_ventes.dto.MessageResponse;
import com.monsite.ventes.gestion_ventes.dto.VendeurProduitRequest;
import com.monsite.ventes.gestion_ventes.dto.VendeurProduitResponse;
import com.monsite.ventes.gestion_ventes.entity.Vendeur;
import com.monsite.ventes.gestion_ventes.service.VendeurProduitService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendeur")
@PreAuthorize("hasRole('VENDEUR')")
public class VendeurController {

    private final VendeurProduitService vendeurProduitService;

    public VendeurController(VendeurProduitService vendeurProduitService) {
        this.vendeurProduitService = vendeurProduitService;
    }

    @PostMapping("/produits/inscrire")
    public ResponseEntity<MessageResponse> inscrireProduit(
            @AuthenticationPrincipal Vendeur vendeur,
            @Valid @RequestBody VendeurProduitRequest request) {
        
        MessageResponse response = vendeurProduitService.inscrireProduit(vendeur.getId(), request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/mes-produits")
    public ResponseEntity<List<VendeurProduitResponse>> getMesProduits(
            @AuthenticationPrincipal Vendeur vendeur) {
        return ResponseEntity.ok(vendeurProduitService.getMesProduits(vendeur.getId()));
    }
}
