package com.monsite.ventes.gestion_ventes.service;

import com.monsite.ventes.gestion_ventes.dto.MessageResponse;
import com.monsite.ventes.gestion_ventes.dto.VendeurProduitRequest;
import com.monsite.ventes.gestion_ventes.dto.VendeurProduitResponse;
import com.monsite.ventes.gestion_ventes.entity.Produit;
import com.monsite.ventes.gestion_ventes.entity.Vendeur;
import com.monsite.ventes.gestion_ventes.entity.VendeurProduit;
import com.monsite.ventes.gestion_ventes.repository.ProduitRepository;
import com.monsite.ventes.gestion_ventes.repository.VendeurProduitRepository;
import com.monsite.ventes.gestion_ventes.repository.VendeurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendeurProduitService {

    private final VendeurProduitRepository vendeurProduitRepository;
    private final VendeurRepository vendeurRepository;
    private final ProduitRepository produitRepository;

    public VendeurProduitService(VendeurProduitRepository vendeurProduitRepository,
                                  VendeurRepository vendeurRepository,
                                  ProduitRepository produitRepository) {
        this.vendeurProduitRepository = vendeurProduitRepository;
        this.vendeurRepository = vendeurRepository;
        this.produitRepository = produitRepository;
    }

    @Transactional
    public MessageResponse inscrireProduit(Long vendeurId, VendeurProduitRequest request) {
        // Vérifier si le vendeur existe et est approuvé
        Vendeur vendeur = vendeurRepository.findById(vendeurId)
                .orElse(null);

        if (vendeur == null) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Vendeur non trouvé")
                    .build();
        }

        if (!vendeur.isEstApprouve()) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Vous devez être approuvé par l'administrateur avant de pouvoir commercialiser des produits")
                    .build();
        }

        // Vérifier si le produit existe
        Produit produit = produitRepository.findById(request.getProduitId())
                .orElse(null);

        if (produit == null) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Produit non trouvé")
                    .build();
        }

        // Vérifier que le prix vendeur est supérieur au prix du produit
        if (request.getPrixVendeur().compareTo(produit.getPrix()) <= 0) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Le prix vendeur doit être supérieur au prix du produit (" + produit.getPrix() + ")")
                    .build();
        }

        // Vérifier si le vendeur n'est pas déjà inscrit à ce produit
        if (vendeurProduitRepository.existsByVendeurIdAndProduitId(vendeurId, request.getProduitId())) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Vous êtes déjà inscrit pour commercialiser ce produit")
                    .build();
        }

        // Créer l'inscription
        VendeurProduit vendeurProduit = new VendeurProduit();
        vendeurProduit.setVendeur(vendeur);
        vendeurProduit.setProduit(produit);
        vendeurProduit.setPrixVendeur(request.getPrixVendeur());
        vendeurProduit.setImage(request.getImage());
        vendeurProduit.setDescription(request.getDescription());
        vendeurProduit.setTitre(request.getTitre());
        vendeurProduit.setEstApprouve(false); // En attente d'approbation

        vendeurProduitRepository.save(vendeurProduit);

        return MessageResponse.builder()
                .success(true)
                .message("Inscription au produit réussie. En attente d'approbation par l'administrateur.")
                .build();
    }

    public List<VendeurProduitResponse> getMesProduits(Long vendeurId) {
        return vendeurProduitRepository.findByVendeurId(vendeurId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<VendeurProduitResponse> getProduitsApprouves() {
        return vendeurProduitRepository.findByEstApprouve(true).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<VendeurProduitResponse> getProduitsEnAttente() {
        return vendeurProduitRepository.findByEstApprouve(false).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private VendeurProduitResponse mapToResponse(VendeurProduit vp) {
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
                .categorieNom(vp.getProduit().getCategorie() != null ? vp.getProduit().getCategorie().getNom() : null)
                .build();
    }
}
