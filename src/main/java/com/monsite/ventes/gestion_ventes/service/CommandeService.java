package com.monsite.ventes.gestion_ventes.service;

import com.monsite.ventes.gestion_ventes.dto.CommandeRequest;
import com.monsite.ventes.gestion_ventes.dto.CommandeResponse;
import com.monsite.ventes.gestion_ventes.dto.MessageResponse;
import com.monsite.ventes.gestion_ventes.dto.VendeurProduitResponse;
import com.monsite.ventes.gestion_ventes.entity.*;
import com.monsite.ventes.gestion_ventes.repository.ClientRepository;
import com.monsite.ventes.gestion_ventes.repository.CommandeRepository;
import com.monsite.ventes.gestion_ventes.repository.PanierRepository;
import com.monsite.ventes.gestion_ventes.repository.VendeurProduitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommandeService {

    private static final Logger logger = LoggerFactory.getLogger(CommandeService.class);

    private final CommandeRepository commandeRepository;
    private final VendeurProduitRepository vendeurProduitRepository;
    private final ClientRepository clientRepository;
    private final PanierRepository panierRepository;

    public CommandeService(CommandeRepository commandeRepository,
                          VendeurProduitRepository vendeurProduitRepository,
                          ClientRepository clientRepository,
                          PanierRepository panierRepository) {
        this.commandeRepository = commandeRepository;
        this.vendeurProduitRepository = vendeurProduitRepository;
        this.clientRepository = clientRepository;
        this.panierRepository = panierRepository;
    }

    @Transactional
    public CommandeResponse passerCommande(Long clientId, CommandeRequest request) {
        logger.info("Tentative de commande pour client ID: {}", clientId);
        
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> {
                    logger.error("Client non trouvé avec ID: {}", clientId);
                    return new RuntimeException("Client non trouvé. Veuillez vous reconnecter.");
                });
        
        logger.info("Client trouvé: {}", client.getEmail());

        // Mettre à jour l'adresse de livraison si fournie
        if (request.getAdresseLivraison() != null && !request.getAdresseLivraison().isEmpty()) {
            client.setAdresseLivraison(request.getAdresseLivraison());
            clientRepository.save(client);
        }

        // Valider les lignes de commande
        if (request.getLignesCommande() == null || request.getLignesCommande().isEmpty()) {
            throw new RuntimeException("Le panier est vide");
        }

        logger.info("Nombre de produits dans la commande: {}", request.getLignesCommande().size());

        // Première passe : vérifier la disponibilité du stock pour tous les produits
        for (CommandeRequest.LigneCommandeRequest ligneRequest : request.getLignesCommande()) {
            VendeurProduit vendeurProduit = vendeurProduitRepository.findById(ligneRequest.getVendeurProduitId())
                    .orElseThrow(() -> new RuntimeException("Produit vendeur non trouvé: " + ligneRequest.getVendeurProduitId()));

            if (!vendeurProduit.isEstApprouve()) {
                throw new RuntimeException("Le produit '" + vendeurProduit.getTitre() + "' n'est pas disponible à la vente");
            }

            // Vérifier le stock dans la table Produit
            Produit produit = vendeurProduit.getProduit();
            if (produit.getQuantite() < ligneRequest.getQuantite()) {
                throw new RuntimeException("Stock insuffisant pour le produit '" + vendeurProduit.getTitre() + 
                    "'. Stock disponible: " + produit.getQuantite() + ", demandé: " + ligneRequest.getQuantite());
            }
        }

        Commande commande = new Commande();
        commande.setClient(client);
        commande.setDateCommande(LocalDateTime.now());
        commande.setStatut(Commande.StatutCommande.EN_ATTENTE);

        List<LigneCommande> lignesCommande = new ArrayList<>();
        BigDecimal montantTotal = BigDecimal.ZERO;

        for (CommandeRequest.LigneCommandeRequest ligneRequest : request.getLignesCommande()) {
            logger.info("Traitement du produit ID: {}", ligneRequest.getVendeurProduitId());
            
            VendeurProduit vendeurProduit = vendeurProduitRepository.findById(ligneRequest.getVendeurProduitId())
                    .orElseThrow(() -> new RuntimeException("Produit vendeur non trouvé: " + ligneRequest.getVendeurProduitId()));

            // Décrémenter le stock dans la table Produit
            Produit produit = vendeurProduit.getProduit();
            produit.setQuantite(produit.getQuantite() - ligneRequest.getQuantite());
            logger.info("Stock mis à jour pour produit {}: nouveau stock = {}", produit.getId(), produit.getQuantite());

            LigneCommande ligneCommande = new LigneCommande();
            ligneCommande.setCommande(commande);
            ligneCommande.setVendeurProduit(vendeurProduit);
            ligneCommande.setQuantite(ligneRequest.getQuantite());
            ligneCommande.setPrixUnitaire(vendeurProduit.getPrixVendeur());
            
            BigDecimal sousTotal = vendeurProduit.getPrixVendeur().multiply(BigDecimal.valueOf(ligneRequest.getQuantite()));
            ligneCommande.setSousTotal(sousTotal);
            
            lignesCommande.add(ligneCommande);
            montantTotal = montantTotal.add(sousTotal);
        }

        commande.setLignesCommande(lignesCommande);
        commande.setMontantTotal(montantTotal);

        logger.info("Sauvegarde de la commande avec montant total: {}", montantTotal);
        Commande savedCommande = commandeRepository.save(commande);
        logger.info("Commande sauvegardée avec succès, ID: {}", savedCommande.getId());

        // Vider le panier du client après la commande
        panierRepository.findByClientId(clientId).ifPresent(panier -> {
            panier.vider();
            panierRepository.save(panier);
            logger.info("Panier du client {} vidé après la commande", clientId);
        });

        // Recharger la commande avec toutes ses relations pour éviter les problèmes de Lazy Loading
        Commande commandeWithDetails = commandeRepository.findByIdWithDetails(savedCommande.getId())
                .orElse(savedCommande);

        return toCommandeResponse(commandeWithDetails);
    }

    public List<CommandeResponse> getMesCommandes(Long clientId) {
        List<Commande> commandes = commandeRepository.findByClientIdWithDetails(clientId);
        return commandes.stream()
                .map(this::toCommandeResponse)
                .collect(Collectors.toList());
    }

    public CommandeResponse getCommandeById(Long clientId, Long commandeId) {
        Commande commande = commandeRepository.findByIdWithDetails(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        if (!commande.getClient().getId().equals(clientId)) {
            throw new RuntimeException("Accès non autorisé à cette commande");
        }

        return toCommandeResponse(commande);
    }

    public List<CommandeResponse> getAllCommandes() {
        return commandeRepository.findAllWithDetails().stream()
                .map(this::toCommandeResponse)
                .collect(Collectors.toList());
    }

    public List<CommandeResponse> getAllCommandesFiltered(Long vendeurId, Long produitId, String statut) {
        List<Commande> commandes = commandeRepository.findAllWithDetails();
        
        return commandes.stream()
                .filter(commande -> {
                    // Filtre par statut
                    if (statut != null && !statut.isEmpty()) {
                        try {
                            Commande.StatutCommande statutEnum = Commande.StatutCommande.valueOf(statut);
                            if (commande.getStatut() != statutEnum) {
                                return false;
                            }
                        } catch (IllegalArgumentException e) {
                            // Statut invalide, ignorer le filtre
                        }
                    }
                    
                    // Filtre par vendeur ou produit
                    if (vendeurId != null || produitId != null) {
                        boolean hasMatch = commande.getLignesCommande().stream().anyMatch(ligne -> {
                            VendeurProduit vp = ligne.getVendeurProduit();
                            if (vendeurId != null && !vp.getVendeur().getId().equals(vendeurId)) {
                                return false;
                            }
                            if (produitId != null && !vp.getProduit().getId().equals(produitId)) {
                                return false;
                            }
                            return true;
                        });
                        return hasMatch;
                    }
                    
                    return true;
                })
                .map(this::toCommandeResponse)
                .collect(Collectors.toList());
    }

    public CommandeResponse getCommandeByIdAdmin(Long commandeId) {
        Commande commande = commandeRepository.findByIdWithDetails(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));
        return toCommandeResponse(commande);
    }

    @Transactional
    public MessageResponse updateStatutCommande(Long commandeId, Commande.StatutCommande nouveauStatut) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        commande.setStatut(nouveauStatut);
        commandeRepository.save(commande);

        return MessageResponse.builder()
                .success(true)
                .message("Statut de la commande mis à jour avec succès")
                .build();
    }

    @Transactional
    public MessageResponse annulerCommande(Long clientId, Long commandeId) {
        Commande commande = commandeRepository.findByIdWithDetails(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande non trouvée"));

        // Vérifier que la commande appartient au client
        if (!commande.getClient().getId().equals(clientId)) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Vous n'êtes pas autorisé à annuler cette commande")
                    .build();
        }

        // Vérifier que la commande peut être annulée (seulement si EN_ATTENTE)
        if (commande.getStatut() != Commande.StatutCommande.EN_ATTENTE) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Impossible d'annuler cette commande. Seules les commandes en attente peuvent être annulées.")
                    .build();
        }

        // Restaurer le stock des produits
        for (LigneCommande ligne : commande.getLignesCommande()) {
            Produit produit = ligne.getVendeurProduit().getProduit();
            produit.setQuantite(produit.getQuantite() + ligne.getQuantite());
            logger.info("Stock restauré pour produit {}: nouveau stock = {}", produit.getId(), produit.getQuantite());
        }

        // Annuler la commande
        commande.setStatut(Commande.StatutCommande.ANNULEE);
        commandeRepository.save(commande);

        return MessageResponse.builder()
                .success(true)
                .message("Commande annulée avec succès. Le stock a été restauré.")
                .build();
    }

    private CommandeResponse toCommandeResponse(Commande commande) {
        List<CommandeResponse.LigneCommandeResponse> lignesResponse = commande.getLignesCommande().stream()
                .map(ligne -> CommandeResponse.LigneCommandeResponse.builder()
                        .id(ligne.getId())
                        .vendeurProduitId(ligne.getVendeurProduit().getId())
                        .vendeurProduit(toVendeurProduitResponse(ligne.getVendeurProduit()))
                        .quantite(ligne.getQuantite())
                        .prixUnitaire(ligne.getPrixUnitaire())
                        .sousTotal(ligne.getSousTotal())
                        .build())
                .collect(Collectors.toList());

        return CommandeResponse.builder()
                .id(commande.getId())
                .clientId(commande.getClient().getId())
                .clientNom(commande.getClient().getNom())
                .dateCommande(commande.getDateCommande())
                .statut(commande.getStatut())
                .montantTotal(commande.getMontantTotal())
                .adresseLivraison(commande.getClient().getAdresseLivraison())
                .lignesCommande(lignesResponse)
                .build();
    }

    private VendeurProduitResponse toVendeurProduitResponse(VendeurProduit vp) {
        return VendeurProduitResponse.builder()
                .id(vp.getId())
                .vendeurId(vp.getVendeur().getId())
                .vendeurNom(vp.getVendeur().getNom())
                .produitId(vp.getProduit().getId())
                .produitNom(vp.getProduit().getNom())
                .prixOriginal(vp.getProduit().getPrix())
                .prixVendeur(vp.getPrixVendeur())
                .image(vp.getImage())
                .description(vp.getDescription())
                .titre(vp.getTitre())
                .estApprouve(vp.isEstApprouve())
                .categorieId(vp.getProduit().getCategorie() != null ? vp.getProduit().getCategorie().getId() : null)
                .categorieNom(vp.getProduit().getCategorie() != null ? vp.getProduit().getCategorie().getNom() : null)
                .quantiteStock(vp.getProduit().getQuantite())
                .build();
    }
}
