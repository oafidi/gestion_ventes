package com.monsite.ventes.gestion_ventes.controller;

import com.monsite.ventes.gestion_ventes.dto.AvisResponse;
import com.monsite.ventes.gestion_ventes.dto.MessageResponse;
import com.monsite.ventes.gestion_ventes.dto.VendeurProduitRequest;
import com.monsite.ventes.gestion_ventes.dto.VendeurProduitResponse;
import com.monsite.ventes.gestion_ventes.entity.Vendeur;
import com.monsite.ventes.gestion_ventes.service.AvisService;
import com.monsite.ventes.gestion_ventes.service.FileStorageService;
import com.monsite.ventes.gestion_ventes.service.VendeurProduitService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/vendeur")
@PreAuthorize("hasRole('VENDEUR')")
public class VendeurController {

    private final VendeurProduitService vendeurProduitService;
    private final FileStorageService fileStorageService;
    private final AvisService avisService;

    public VendeurController(VendeurProduitService vendeurProduitService,
                             FileStorageService fileStorageService,
                             AvisService avisService) {
        this.vendeurProduitService = vendeurProduitService;
        this.fileStorageService = fileStorageService;
        this.avisService = avisService;
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

    @GetMapping("/mes-produits/{id}")
    public ResponseEntity<VendeurProduitResponse> getMonProduit(
            @AuthenticationPrincipal Vendeur vendeur,
            @PathVariable Long id) {
        VendeurProduitResponse response = vendeurProduitService.getVendeurProduitById(vendeur.getId(), id);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/mes-produits/{id}")
    public ResponseEntity<MessageResponse> modifierProduit(
            @AuthenticationPrincipal Vendeur vendeur,
            @PathVariable Long id,
            @RequestParam("titre") String titre,
            @RequestParam("prixVendeur") BigDecimal prixVendeur,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        String imagePath = null;
        if (image != null && !image.isEmpty()) {
            imagePath = fileStorageService.storeFile(image, "vendeur-produits");
        }

        MessageResponse response = vendeurProduitService.modifierVendeurProduit(
                vendeur.getId(), id, prixVendeur, titre, description, imagePath);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @PutMapping("/mes-produits/{id}/json")
    public ResponseEntity<MessageResponse> modifierProduitJson(
            @AuthenticationPrincipal Vendeur vendeur,
            @PathVariable Long id,
            @RequestBody VendeurProduitRequest request) {
        
        MessageResponse response = vendeurProduitService.modifierVendeurProduit(
                vendeur.getId(), id, request.getPrixVendeur(), request.getTitre(), 
                request.getDescription(), request.getImage());
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ========== Gestion des Avis ==========

    @GetMapping("/avis")
    public ResponseEntity<List<AvisResponse>> getMesAvis(@AuthenticationPrincipal Vendeur vendeur) {
        List<AvisResponse> avis = avisService.getAvisParVendeur(vendeur.getId());
        return ResponseEntity.ok(avis);
    }

    @PutMapping("/avis/{avisId}/toggle-visibilite")
    public ResponseEntity<MessageResponse> toggleVisibiliteAvis(
            @AuthenticationPrincipal Vendeur vendeur,
            @PathVariable Long avisId) {
        MessageResponse response = avisService.toggleVisibiliteAvis(vendeur.getId(), avisId);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
}
