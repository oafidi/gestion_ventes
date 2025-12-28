package com.monsite.ventes.gestion_ventes.controller;

import com.monsite.ventes.gestion_ventes.dto.AvisRequest;
import com.monsite.ventes.gestion_ventes.dto.AvisResponse;
import com.monsite.ventes.gestion_ventes.dto.MessageResponse;
import com.monsite.ventes.gestion_ventes.entity.Utilisateur;
import com.monsite.ventes.gestion_ventes.service.AvisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/avis")
public class AvisController {

    private final AvisService avisService;

    public AvisController(AvisService avisService) {
        this.avisService = avisService;
    }

    /**
     * Récupérer les avis d'un produit (public)
     */
    @GetMapping("/produit/{vendeurProduitId}")
    public ResponseEntity<List<AvisResponse>> getAvisParProduit(@PathVariable Long vendeurProduitId) {
        List<AvisResponse> avis = avisService.getAvisParProduit(vendeurProduitId);
        return ResponseEntity.ok(avis);
    }

    /**
     * Récupérer les statistiques d'avis d'un produit (public)
     */
    @GetMapping("/produit/{vendeurProduitId}/stats")
    public ResponseEntity<Map<String, Object>> getStatsAvis(@PathVariable Long vendeurProduitId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("moyenne", avisService.getMoyenneNotes(vendeurProduitId));
        stats.put("nombreAvis", avisService.getNombreAvis(vendeurProduitId));
        return ResponseEntity.ok(stats);
    }

    /**
     * Ajouter un avis (client authentifié)
     */
    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<MessageResponse> ajouterAvis(
            @AuthenticationPrincipal Utilisateur utilisateur,
            @Valid @RequestBody AvisRequest request) {
        MessageResponse response = avisService.ajouterAvis(utilisateur.getId(), request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
}
