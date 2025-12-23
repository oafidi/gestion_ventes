package com.monsite.ventes.gestion_ventes.service;

import com.monsite.ventes.gestion_ventes.dto.MessageResponse;
import com.monsite.ventes.gestion_ventes.entity.Categorie;
import com.monsite.ventes.gestion_ventes.entity.Produit;
import com.monsite.ventes.gestion_ventes.entity.Vendeur;
import com.monsite.ventes.gestion_ventes.entity.VendeurProduit;
import com.monsite.ventes.gestion_ventes.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final VendeurRepository vendeurRepository;
    private final VendeurProduitRepository vendeurProduitRepository;
    private final CategorieRepository categorieRepository;
    private final ProduitRepository produitRepository;
    private final CommandeRepository commandeRepository;

    public AdminService(VendeurRepository vendeurRepository,
                        VendeurProduitRepository vendeurProduitRepository,
                        CategorieRepository categorieRepository,
                        ProduitRepository produitRepository,
                        CommandeRepository commandeRepository) {
        this.vendeurRepository = vendeurRepository;
        this.vendeurProduitRepository = vendeurProduitRepository;
        this.categorieRepository = categorieRepository;
        this.produitRepository = produitRepository;
        this.commandeRepository = commandeRepository;
    }

    // ========== Gestion des Vendeurs ==========

    public List<Vendeur> getVendeursEnAttente() {
        return vendeurRepository.findByEstApprouve(false);
    }

    public List<Vendeur> getVendeursApprouves() {
        return vendeurRepository.findByEstApprouve(true);
    }

    @Transactional
    public MessageResponse approuverVendeur(Long vendeurId) {
        Vendeur vendeur = vendeurRepository.findById(vendeurId)
                .orElse(null);

        if (vendeur == null) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Vendeur non trouvé")
                    .build();
        }

        vendeur.setEstApprouve(true);
        vendeurRepository.save(vendeur);

        return MessageResponse.builder()
                .success(true)
                .message("Vendeur " + vendeur.getNom() + " approuvé avec succès")
                .build();
    }

    @Transactional
    public MessageResponse rejeterVendeur(Long vendeurId) {
        Vendeur vendeur = vendeurRepository.findById(vendeurId)
                .orElse(null);

        if (vendeur == null) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Vendeur non trouvé")
                    .build();
        }

        vendeurRepository.delete(vendeur);

        return MessageResponse.builder()
                .success(true)
                .message("Vendeur rejeté et supprimé")
                .build();
    }

    // ========== Gestion des VendeurProduits ==========

    public List<VendeurProduit> getVendeurProduitsEnAttente() {
        return vendeurProduitRepository.findByEstApprouve(false);
    }

    @Transactional
    public MessageResponse approuverVendeurProduit(Long vendeurProduitId) {
        VendeurProduit vendeurProduit = vendeurProduitRepository.findById(vendeurProduitId)
                .orElse(null);

        if (vendeurProduit == null) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Inscription vendeur-produit non trouvée")
                    .build();
        }

        vendeurProduit.setEstApprouve(true);
        vendeurProduitRepository.save(vendeurProduit);

        return MessageResponse.builder()
                .success(true)
                .message("Inscription du vendeur pour le produit approuvée")
                .build();
    }

    @Transactional
    public MessageResponse rejeterVendeurProduit(Long vendeurProduitId) {
        VendeurProduit vendeurProduit = vendeurProduitRepository.findById(vendeurProduitId)
                .orElse(null);

        if (vendeurProduit == null) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Inscription vendeur-produit non trouvée")
                    .build();
        }

        vendeurProduitRepository.delete(vendeurProduit);

        return MessageResponse.builder()
                .success(true)
                .message("Inscription du vendeur pour le produit rejetée")
                .build();
    }

    // ========== Gestion des Catégories ==========

    public List<Categorie> getAllCategories() {
        return categorieRepository.findAll();
    }

    @Transactional
    public Categorie createCategorie(Categorie categorie) {
        return categorieRepository.save(categorie);
    }

    @Transactional
    public Categorie updateCategorie(Long id, Categorie categorieDetails) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
        
        categorie.setNom(categorieDetails.getNom());
        categorie.setImage(categorieDetails.getImage());
        
        return categorieRepository.save(categorie);
    }

    @Transactional
    public void deleteCategorie(Long id) {
        categorieRepository.deleteById(id);
    }

    // ========== Gestion des Produits ==========

    public List<Produit> getAllProduits() {
        return produitRepository.findAll();
    }

    @Transactional
    public Produit createProduit(Produit produit) {
        produit.setDateDernierStock(LocalDate.now());
        return produitRepository.save(produit);
    }

    @Transactional
    public Produit updateProduit(Long id, Produit produitDetails) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        
        produit.setNom(produitDetails.getNom());
        produit.setDescription(produitDetails.getDescription());
        produit.setPrix(produitDetails.getPrix());
        produit.setQuantite(produitDetails.getQuantite());
        produit.setImage(produitDetails.getImage());
        produit.setCategorie(produitDetails.getCategorie());
        
        return produitRepository.save(produit);
    }

    @Transactional
    public MessageResponse updateStock(Long produitId, Integer quantite) {
        Produit produit = produitRepository.findById(produitId)
                .orElse(null);

        if (produit == null) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Produit non trouvé")
                    .build();
        }

        produit.setQuantite(quantite);
        produit.setDateDernierStock(LocalDate.now());
        produitRepository.save(produit);

        return MessageResponse.builder()
                .success(true)
                .message("Stock mis à jour avec succès")
                .build();
    }

    @Transactional
    public void deleteProduit(Long id) {
        produitRepository.deleteById(id);
    }

    // ========== Statistiques ==========

    public Map<String, Object> getStatistiques() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalVendeurs", vendeurRepository.count());
        stats.put("vendeursApprouves", vendeurRepository.findByEstApprouve(true).size());
        stats.put("vendeursEnAttente", vendeurRepository.findByEstApprouve(false).size());
        stats.put("totalProduits", produitRepository.count());
        stats.put("totalCategories", categorieRepository.count());
        stats.put("totalCommandes", commandeRepository.count());
        stats.put("inscriptionsProduitsEnAttente", vendeurProduitRepository.findByEstApprouve(false).size());
        
        return stats;
    }
}
