package com.monsite.ventes.gestion_ventes.controller;

import com.monsite.ventes.gestion_ventes.dto.MessageResponse;
import com.monsite.ventes.gestion_ventes.dto.PanierRequest;
import com.monsite.ventes.gestion_ventes.dto.PanierResponse;
import com.monsite.ventes.gestion_ventes.entity.Utilisateur;
import com.monsite.ventes.gestion_ventes.service.PanierService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/client/panier")
@PreAuthorize("hasRole('CLIENT')")
public class PanierController {

    private static final Logger logger = LoggerFactory.getLogger(PanierController.class);

    private final PanierService panierService;

    public PanierController(PanierService panierService) {
        this.panierService = panierService;
    }

    /**
     * Récupère le panier du client connecté
     */
    @GetMapping
    public ResponseEntity<?> getPanier(@AuthenticationPrincipal Utilisateur utilisateur) {
        logger.info("GET /api/client/panier - Client ID: {}", utilisateur.getId());
        
        try {
            PanierResponse panier = panierService.getPanier(utilisateur.getId());
            return ResponseEntity.ok(panier);
        } catch (Exception e) {
            logger.error("Erreur lors de la récupération du panier", e);
            return ResponseEntity.badRequest().body(
                MessageResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build()
            );
        }
    }

    /**
     * Ajoute un produit au panier
     */
    @PostMapping("/ajouter")
    public ResponseEntity<?> ajouterProduit(
            @AuthenticationPrincipal Utilisateur utilisateur,
            @RequestBody PanierRequest.AjouterProduit request) {
        logger.info("POST /api/client/panier/ajouter - Client ID: {}, Produit ID: {}", 
                utilisateur.getId(), request.getVendeurProduitId());
        
        try {
            PanierResponse panier = panierService.ajouterProduit(utilisateur.getId(), request);
            return ResponseEntity.ok(panier);
        } catch (Exception e) {
            logger.error("Erreur lors de l'ajout au panier", e);
            return ResponseEntity.badRequest().body(
                MessageResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build()
            );
        }
    }

    /**
     * Modifie la quantité d'un produit dans le panier
     */
    @PutMapping("/modifier")
    public ResponseEntity<?> modifierQuantite(
            @AuthenticationPrincipal Utilisateur utilisateur,
            @RequestBody PanierRequest.ModifierQuantite request) {
        logger.info("PUT /api/client/panier/modifier - Client ID: {}, Produit ID: {}, Quantité: {}", 
                utilisateur.getId(), request.getVendeurProduitId(), request.getQuantite());
        
        try {
            PanierResponse panier = panierService.modifierQuantite(utilisateur.getId(), request);
            return ResponseEntity.ok(panier);
        } catch (Exception e) {
            logger.error("Erreur lors de la modification de la quantité", e);
            return ResponseEntity.badRequest().body(
                MessageResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build()
            );
        }
    }

    /**
     * Supprime un produit du panier
     */
    @DeleteMapping("/produit/{vendeurProduitId}")
    public ResponseEntity<?> supprimerProduit(
            @AuthenticationPrincipal Utilisateur utilisateur,
            @PathVariable Long vendeurProduitId) {
        logger.info("DELETE /api/client/panier/produit/{} - Client ID: {}", 
                vendeurProduitId, utilisateur.getId());
        
        try {
            PanierResponse panier = panierService.supprimerProduit(utilisateur.getId(), vendeurProduitId);
            return ResponseEntity.ok(panier);
        } catch (Exception e) {
            logger.error("Erreur lors de la suppression du produit", e);
            return ResponseEntity.badRequest().body(
                MessageResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build()
            );
        }
    }

    /**
     * Vide le panier
     */
    @DeleteMapping("/vider")
    public ResponseEntity<?> viderPanier(@AuthenticationPrincipal Utilisateur utilisateur) {
        logger.info("DELETE /api/client/panier/vider - Client ID: {}", utilisateur.getId());
        
        try {
            MessageResponse response = panierService.viderPanier(utilisateur.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Erreur lors du vidage du panier", e);
            return ResponseEntity.badRequest().body(
                MessageResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build()
            );
        }
    }
}
