package com.monsite.ventes.gestion_ventes.service;

import com.monsite.ventes.gestion_ventes.dto.MessageResponse;
import com.monsite.ventes.gestion_ventes.dto.PanierRequest;
import com.monsite.ventes.gestion_ventes.dto.PanierResponse;
import com.monsite.ventes.gestion_ventes.entity.*;
import com.monsite.ventes.gestion_ventes.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PanierService {

    private static final Logger logger = LoggerFactory.getLogger(PanierService.class);

    private final PanierRepository panierRepository;
    private final LignePanierRepository lignePanierRepository;
    private final ClientRepository clientRepository;
    private final VendeurProduitRepository vendeurProduitRepository;

    public PanierService(PanierRepository panierRepository,
                         LignePanierRepository lignePanierRepository,
                         ClientRepository clientRepository,
                         VendeurProduitRepository vendeurProduitRepository) {
        this.panierRepository = panierRepository;
        this.lignePanierRepository = lignePanierRepository;
        this.clientRepository = clientRepository;
        this.vendeurProduitRepository = vendeurProduitRepository;
    }

    /**
     * Récupère le panier d'un client (le crée s'il n'existe pas)
     */
    @Transactional
    public PanierResponse getPanier(Long clientId) {
        logger.info("Récupération du panier pour le client ID: {}", clientId);
        
        Panier panier = getOrCreatePanier(clientId);
        return toPanierResponse(panier);
    }

    /**
     * Ajoute un produit au panier
     */
    @Transactional
    public PanierResponse ajouterProduit(Long clientId, PanierRequest.AjouterProduit request) {
        logger.info("=== DEBUT ajouterProduit ===");
        logger.info("Client ID: {}", clientId);
        logger.info("VendeurProduit ID: {}", request.getVendeurProduitId());
        logger.info("Quantite: {}", request.getQuantite());

        // Validation des paramètres
        if (request.getVendeurProduitId() == null) {
            throw new RuntimeException("L'ID du produit est requis");
        }
        if (request.getQuantite() == null || request.getQuantite() <= 0) {
            throw new RuntimeException("La quantité doit être supérieure à 0");
        }

        Panier panier = getOrCreatePanier(clientId);
        logger.info("Panier récupéré/créé - ID: {}", panier.getId());

        VendeurProduit vendeurProduit = vendeurProduitRepository.findById(request.getVendeurProduitId())
                .orElseThrow(() -> new RuntimeException("Produit vendeur non trouvé"));

        if (!vendeurProduit.isEstApprouve()) {
            throw new RuntimeException("Ce produit n'est pas disponible à la vente");
        }

        // Vérifier le stock disponible
        int stockDisponible = vendeurProduit.getProduit().getQuantite();
        if (stockDisponible <= 0) {
            throw new RuntimeException("Ce produit est en rupture de stock");
        }

        // Vérifier si le produit existe déjà dans le panier
        Optional<LignePanier> lignePanierExistante = lignePanierRepository
                .findByPanierIdAndVendeurProduitId(panier.getId(), request.getVendeurProduitId());

        if (lignePanierExistante.isPresent()) {
            // Mettre à jour la quantité
            LignePanier ligne = lignePanierExistante.get();
            int nouvelleQuantite = ligne.getQuantite() + request.getQuantite();
            
            if (nouvelleQuantite > stockDisponible) {
                throw new RuntimeException("Stock insuffisant. Disponible: " + stockDisponible);
            }
            
            ligne.setQuantite(nouvelleQuantite);
            lignePanierRepository.save(ligne);
            logger.info("Ligne de panier mise à jour - ID: {}, nouvelle quantité: {}", ligne.getId(), nouvelleQuantite);
        } else {
            // Créer une nouvelle ligne de panier
            if (request.getQuantite() > stockDisponible) {
                throw new RuntimeException("Stock insuffisant. Disponible: " + stockDisponible);
            }

            LignePanier nouvelleLigne = new LignePanier();
            nouvelleLigne.setPanier(panier);
            nouvelleLigne.setVendeurProduit(vendeurProduit);
            nouvelleLigne.setQuantite(request.getQuantite());
            nouvelleLigne.setPrixUnitaire(vendeurProduit.getPrixVendeur());
            
            // Sauvegarder explicitement la nouvelle ligne
            LignePanier savedLigne = lignePanierRepository.save(nouvelleLigne);
            logger.info("Nouvelle ligne de panier créée - ID: {}, Produit: {}, Quantité: {}", 
                    savedLigne.getId(), request.getVendeurProduitId(), request.getQuantite());
        }

        panier.setDateModification(LocalDateTime.now());
        panierRepository.save(panier);
        
        logger.info("=== FIN ajouterProduit - Panier sauvegardé avec succès ===");

        // Recharger le panier avec les détails
        return getPanier(clientId);
    }

    /**
     * Modifie la quantité d'un produit dans le panier
     */
    @Transactional
    public PanierResponse modifierQuantite(Long clientId, PanierRequest.ModifierQuantite request) {
        logger.info("Modification de la quantité du produit {} pour le client {}", 
                request.getVendeurProduitId(), clientId);

        Panier panier = panierRepository.findByClientId(clientId)
                .orElseThrow(() -> new RuntimeException("Panier non trouvé"));

        LignePanier ligne = lignePanierRepository
                .findByPanierIdAndVendeurProduitId(panier.getId(), request.getVendeurProduitId())
                .orElseThrow(() -> new RuntimeException("Produit non trouvé dans le panier"));

        if (request.getQuantite() <= 0) {
            // Supprimer la ligne si quantité <= 0
            panier.getLignesPanier().remove(ligne);
            lignePanierRepository.delete(ligne);
        } else {
            // Vérifier le stock
            int stockDisponible = ligne.getVendeurProduit().getProduit().getQuantite();
            if (request.getQuantite() > stockDisponible) {
                throw new RuntimeException("Stock insuffisant. Disponible: " + stockDisponible);
            }
            ligne.setQuantite(request.getQuantite());
            lignePanierRepository.save(ligne);
        }

        panier.setDateModification(LocalDateTime.now());
        panierRepository.save(panier);

        return getPanier(clientId);
    }

    /**
     * Supprime un produit du panier
     */
    @Transactional
    public PanierResponse supprimerProduit(Long clientId, Long vendeurProduitId) {
        logger.info("Suppression du produit {} du panier du client {}", vendeurProduitId, clientId);

        Panier panier = panierRepository.findByClientId(clientId)
                .orElseThrow(() -> new RuntimeException("Panier non trouvé"));

        LignePanier ligne = lignePanierRepository
                .findByPanierIdAndVendeurProduitId(panier.getId(), vendeurProduitId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé dans le panier"));

        panier.getLignesPanier().remove(ligne);
        lignePanierRepository.delete(ligne);

        panier.setDateModification(LocalDateTime.now());
        panierRepository.save(panier);

        return getPanier(clientId);
    }

    /**
     * Vide le panier
     */
    @Transactional
    public MessageResponse viderPanier(Long clientId) {
        logger.info("Vidage du panier du client {}", clientId);

        Optional<Panier> panierOpt = panierRepository.findByClientId(clientId);
        
        if (panierOpt.isPresent()) {
            Panier panier = panierOpt.get();
            panier.vider();
            panierRepository.save(panier);
        }
        // Si le panier n'existe pas, on ne fait rien (pas d'erreur)

        return MessageResponse.builder()
                .success(true)
                .message("Panier vidé avec succès")
                .build();
    }

    /**
     * Récupère ou crée le panier d'un client
     */
    private Panier getOrCreatePanier(Long clientId) {
        Optional<Panier> panierOpt = panierRepository.findByClientIdWithDetails(clientId);
        
        if (panierOpt.isPresent()) {
            return panierOpt.get();
        }

        // Créer un nouveau panier pour le client
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client non trouvé"));

        Panier nouveauPanier = new Panier();
        nouveauPanier.setClient(client);
        nouveauPanier.setLignesPanier(new ArrayList<>());
        nouveauPanier.setDateCreation(LocalDateTime.now());
        nouveauPanier.setDateModification(LocalDateTime.now());

        return panierRepository.save(nouveauPanier);
    }

    /**
     * Convertit un Panier en PanierResponse
     */
    private PanierResponse toPanierResponse(Panier panier) {
        List<PanierResponse.LignePanierResponse> lignesResponse = panier.getLignesPanier().stream()
                .map(this::toLignePanierResponse)
                .collect(Collectors.toList());

        return PanierResponse.builder()
                .id(panier.getId())
                .clientId(panier.getClient().getId())
                .clientNom(panier.getClient().getNom())
                .lignesPanier(lignesResponse)
                .montantTotal(panier.getMontantTotal())
                .nombreProduits(panier.getNombreProduits())
                .dateCreation(panier.getDateCreation())
                .dateModification(panier.getDateModification())
                .build();
    }

    /**
     * Convertit une LignePanier en LignePanierResponse
     */
    private PanierResponse.LignePanierResponse toLignePanierResponse(LignePanier ligne) {
        VendeurProduit vp = ligne.getVendeurProduit();
        Produit produit = vp.getProduit();

        return PanierResponse.LignePanierResponse.builder()
                .id(ligne.getId())
                .vendeurProduitId(vp.getId())
                .produitNom(produit.getNom())
                .produitTitre(vp.getTitre() != null ? vp.getTitre() : produit.getNom())
                .produitImage(vp.getImage() != null ? vp.getImage() : produit.getImage())
                .vendeurNom(vp.getVendeur().getNom())
                .quantite(ligne.getQuantite())
                .prixUnitaire(ligne.getPrixUnitaire())
                .sousTotal(ligne.getSousTotal())
                .stockDisponible(produit.getQuantite())
                .build();
    }
}
