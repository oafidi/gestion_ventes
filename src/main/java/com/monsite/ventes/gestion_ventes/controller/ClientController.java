package com.monsite.ventes.gestion_ventes.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.monsite.ventes.gestion_ventes.dto.CommandeRequest;
import com.monsite.ventes.gestion_ventes.dto.CommandeResponse;
import com.monsite.ventes.gestion_ventes.dto.MessageResponse;
import com.monsite.ventes.gestion_ventes.dto.VendeurProduitResponse;
import com.monsite.ventes.gestion_ventes.entity.*;
import com.monsite.ventes.gestion_ventes.repository.*;
import com.monsite.ventes.gestion_ventes.service.CommandeService;
import com.monsite.ventes.gestion_ventes.service.RecommendationService;

@RestController
@RequestMapping("/api/client")
@PreAuthorize("hasRole('CLIENT')")
public class ClientController {

    private static final Logger logger = LoggerFactory.getLogger(ClientController.class);

    private final ClientRepository clientRepository;
    private final CommandeService commandeService;
    private final RecommendationService recommendationService;

    public ClientController(ClientRepository clientRepository, 
                            CommandeService commandeService,
                            RecommendationService recommendationService) {
        this.clientRepository = clientRepository;
        this.commandeService = commandeService;
        this.recommendationService = recommendationService;
    }

    @GetMapping("/debug")
    public ResponseEntity<?> debugAuth(@AuthenticationPrincipal Utilisateur utilisateur) {
        logger.info("=== DEBUG AUTH CLIENT ===");
        if (utilisateur == null) {
            logger.error("Utilisateur NULL");
            return ResponseEntity.status(401).body("Utilisateur non authentifié");
        }
        logger.info("ID: {}", utilisateur.getId());
        logger.info("Email: {}", utilisateur.getEmail());
        logger.info("Role: {}", utilisateur.getRole());
        logger.info("Authorities: {}", utilisateur.getAuthorities());
        return ResponseEntity.ok("Auth OK - Role: " + utilisateur.getRole() + ", Email: " + utilisateur.getEmail());
    }

    @GetMapping("/profil")
    public ResponseEntity<Client> getMonProfil(@AuthenticationPrincipal Utilisateur utilisateur) {
        Client client = clientRepository.findById(utilisateur.getId())
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        return ResponseEntity.ok(client);
    }

    @PutMapping("/profil")
    public ResponseEntity<MessageResponse> updateProfil(
            @AuthenticationPrincipal Utilisateur utilisateur,
            @RequestBody Client clientDetails) {
        
        Client client = clientRepository.findById(utilisateur.getId())
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));
        
        client.setNom(clientDetails.getNom());
        client.setTelephone(clientDetails.getTelephone());
        client.setAdresseLivraison(clientDetails.getAdresseLivraison());
        clientRepository.save(client);
        
        return ResponseEntity.ok(MessageResponse.builder()
                .success(true)
                .message("Profil mis à jour avec succès")
                .build());
    }

    @PostMapping("/commandes")
    public ResponseEntity<?> passerCommande(
            @AuthenticationPrincipal Utilisateur utilisateur,
            @RequestBody CommandeRequest request) {
        logger.info("=== DEBUT passerCommande ===");
        logger.info("Utilisateur reçu: {}", utilisateur);
        
        if (utilisateur == null) {
            logger.error("Utilisateur est NULL - pas d'authentification");
            return ResponseEntity.status(401).body(
                MessageResponse.builder()
                    .success(false)
                    .message("Non authentifié")
                    .build()
            );
        }
        
        logger.info("Utilisateur ID: {}", utilisateur.getId());
        logger.info("Utilisateur Email: {}", utilisateur.getEmail());
        logger.info("Utilisateur Role: {}", utilisateur.getRole());
        logger.info("Utilisateur Authorities: {}", utilisateur.getAuthorities());
        
        try {
            CommandeResponse commande = commandeService.passerCommande(utilisateur.getId(), request);
            logger.info("=== FIN passerCommande - SUCCES ===");
            return ResponseEntity.ok(commande);
        } catch (Exception e) {
            logger.error("=== FIN passerCommande - ERREUR ===", e);
            return ResponseEntity.badRequest().body(
                MessageResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build()
            );
        }
    }

    @GetMapping("/commandes")
    public ResponseEntity<List<CommandeResponse>> getMesCommandes(@AuthenticationPrincipal Utilisateur utilisateur) {
        List<CommandeResponse> commandes = commandeService.getMesCommandes(utilisateur.getId());
        return ResponseEntity.ok(commandes);
    }

    @GetMapping("/commandes/{id}")
    public ResponseEntity<CommandeResponse> getCommande(
            @AuthenticationPrincipal Utilisateur utilisateur,
            @PathVariable Long id) {
        CommandeResponse commande = commandeService.getCommandeById(utilisateur.getId(), id);
        return ResponseEntity.ok(commande);
    }

    @PostMapping("/commandes/{id}/annuler")
    public ResponseEntity<MessageResponse> annulerCommande(
            @AuthenticationPrincipal Utilisateur utilisateur,
            @PathVariable Long id) {
        try {
            MessageResponse response = commandeService.annulerCommande(utilisateur.getId(), id);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                MessageResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build()
            );
        }
    }

    // ========== Recommandations ==========

    /**
     * Vérifie si le client a déjà passé une commande.
     */
    @GetMapping("/has-orders")
    public ResponseEntity<Boolean> hasOrders(@AuthenticationPrincipal Utilisateur utilisateur) {
        boolean hasOrders = recommendationService.clientHasOrders(utilisateur.getId());
        return ResponseEntity.ok(hasOrders);
    }

    /**
     * Récupère les produits recommandés pour le client connecté.
     * Ces produits sont basés sur les achats de clients similaires.
     */
    @GetMapping("/recommendations")
    public ResponseEntity<List<VendeurProduitResponse>> getRecommendations(
            @AuthenticationPrincipal Utilisateur utilisateur,
            @RequestParam(defaultValue = "3") int maxSimilarClients) {
        logger.info("Récupération des recommandations pour le client {}", utilisateur.getId());
        
        // Vérifier d'abord si le client a des commandes
        if (!recommendationService.clientHasOrders(utilisateur.getId())) {
            logger.info("Le client {} n'a pas encore de commandes, pas de recommandations", utilisateur.getId());
            return ResponseEntity.ok(List.of());
        }

        List<VendeurProduitResponse> recommendations = 
                recommendationService.getRecommendedProducts(utilisateur.getId(), maxSimilarClients);
        
        logger.info("Trouvé {} recommandations pour le client {}", recommendations.size(), utilisateur.getId());
        return ResponseEntity.ok(recommendations);
    }
}