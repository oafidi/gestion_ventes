package com.monsite.ventes.gestion_ventes.controller;

import com.monsite.ventes.gestion_ventes.entity.Produit;
import com.monsite.ventes.gestion_ventes.entity.Categorie;
import com.monsite.ventes.gestion_ventes.repository.ProduitRepository;
import com.monsite.ventes.gestion_ventes.repository.CategorieRepository;
import com.monsite.ventes.gestion_ventes.service.FileStorageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    private final ProduitRepository produitRepository;
    private final CategorieRepository categorieRepository;
    private final FileStorageService fileStorageService;

    public ProduitController(ProduitRepository produitRepository, 
                            CategorieRepository categorieRepository,
                            FileStorageService fileStorageService) {
        this.produitRepository = produitRepository;
        this.categorieRepository = categorieRepository;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public ResponseEntity<List<Produit>> getAllProduits() {
        return ResponseEntity.ok(produitRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produit> getProduitById(@PathVariable Long id) {
        return produitRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categorie/{categorieId}")
    public ResponseEntity<List<Produit>> getProduitsByCategorie(@PathVariable Long categorieId) {
        return ResponseEntity.ok(produitRepository.findByCategorieId(categorieId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Produit>> searchProduits(@RequestParam String nom) {
        return ResponseEntity.ok(produitRepository.findByNomContainingIgnoreCase(nom));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Produit> createProduit(
            @RequestParam("nom") String nom,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("prix") BigDecimal prix,
            @RequestParam("quantite") Integer quantite,
            @RequestParam(value = "categorieId", required = false) Long categorieId,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        Produit produit = new Produit();
        produit.setNom(nom);
        produit.setDescription(description);
        produit.setPrix(prix);
        produit.setQuantite(quantite);
        produit.setDateDernierStock(LocalDate.now());

        if (categorieId != null) {
            categorieRepository.findById(categorieId)
                    .ifPresent(produit::setCategorie);
        }

        if (image != null && !image.isEmpty()) {
            String imagePath = fileStorageService.storeFile(image);
            produit.setImage(imagePath);
        }

            Produit savedProduit = produitRepository.save(produit);
            return ResponseEntity.ok(savedProduit);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Produit> updateProduit(
            @PathVariable Long id,
            @RequestParam("nom") String nom,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("prix") BigDecimal prix,
            @RequestParam("quantite") Integer quantite,
            @RequestParam(value = "categorieId", required = false) Long categorieId,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return produitRepository.findById(id)
                .map(existingProduit -> {
                    existingProduit.setNom(nom);
                    existingProduit.setDescription(description);
                    existingProduit.setPrix(prix);
                    
                    // Mettre à jour dateDernierStock si la quantité change
                    if (!existingProduit.getQuantite().equals(quantite)) {
                        existingProduit.setDateDernierStock(LocalDate.now());
                    }
                    existingProduit.setQuantite(quantite);

                    if (categorieId != null) {
                        categorieRepository.findById(categorieId)
                                .ifPresent(existingProduit::setCategorie);
                    } else {
                        existingProduit.setCategorie(null);
                    }

                    if (image != null && !image.isEmpty()) {
                        // Supprimer l'ancienne image
                        if (existingProduit.getImage() != null) {
                            fileStorageService.deleteFile(existingProduit.getImage());
                        }
                        String imagePath = fileStorageService.storeFile(image);
                        existingProduit.setImage(imagePath);
                    }

                    return ResponseEntity.ok(produitRepository.save(existingProduit));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduit(@PathVariable Long id) {
        return produitRepository.findById(id)
                .map(produit -> {
                    if (produit.getImage() != null) {
                        fileStorageService.deleteFile(produit.getImage());
                    }
                    produitRepository.delete(produit);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
