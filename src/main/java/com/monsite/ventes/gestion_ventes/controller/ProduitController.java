package com.monsite.ventes.gestion_ventes.controller;

import com.monsite.ventes.gestion_ventes.entity.Produit;
import com.monsite.ventes.gestion_ventes.repository.ProduitRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    private final ProduitRepository produitRepository;

    public ProduitController(ProduitRepository produitRepository) {
        this.produitRepository = produitRepository;
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
}
