package com.monsite.ventes.gestion_ventes.controller;

import com.monsite.ventes.gestion_ventes.dto.MessageResponse;
import com.monsite.ventes.gestion_ventes.entity.Categorie;
import com.monsite.ventes.gestion_ventes.entity.Produit;
import com.monsite.ventes.gestion_ventes.entity.Vendeur;
import com.monsite.ventes.gestion_ventes.entity.VendeurProduit;
import com.monsite.ventes.gestion_ventes.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ========== Gestion des Vendeurs ==========

    @GetMapping("/vendeurs/en-attente")
    public ResponseEntity<List<Vendeur>> getVendeursEnAttente() {
        return ResponseEntity.ok(adminService.getVendeursEnAttente());
    }

    @GetMapping("/vendeurs/approuves")
    public ResponseEntity<List<Vendeur>> getVendeursApprouves() {
        return ResponseEntity.ok(adminService.getVendeursApprouves());
    }

    @PostMapping("/vendeurs/{id}/approuver")
    public ResponseEntity<MessageResponse> approuverVendeur(@PathVariable Long id) {
        MessageResponse response = adminService.approuverVendeur(id);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @DeleteMapping("/vendeurs/{id}/rejeter")
    public ResponseEntity<MessageResponse> rejeterVendeur(@PathVariable Long id) {
        MessageResponse response = adminService.rejeterVendeur(id);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ========== Gestion des VendeurProduits ==========

    @GetMapping("/vendeur-produits/en-attente")
    public ResponseEntity<List<VendeurProduit>> getVendeurProduitsEnAttente() {
        return ResponseEntity.ok(adminService.getVendeurProduitsEnAttente());
    }

    @PostMapping("/vendeur-produits/{id}/approuver")
    public ResponseEntity<MessageResponse> approuverVendeurProduit(@PathVariable Long id) {
        MessageResponse response = adminService.approuverVendeurProduit(id);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @DeleteMapping("/vendeur-produits/{id}/rejeter")
    public ResponseEntity<MessageResponse> rejeterVendeurProduit(@PathVariable Long id) {
        MessageResponse response = adminService.rejeterVendeurProduit(id);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    // ========== Gestion des Catégories ==========

    @GetMapping("/categories")
    public ResponseEntity<List<Categorie>> getAllCategories() {
        return ResponseEntity.ok(adminService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<Categorie> createCategorie(@RequestBody Categorie categorie) {
        return ResponseEntity.ok(adminService.createCategorie(categorie));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Categorie> updateCategorie(@PathVariable Long id, @RequestBody Categorie categorie) {
        return ResponseEntity.ok(adminService.updateCategorie(id, categorie));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategorie(@PathVariable Long id) {
        adminService.deleteCategorie(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Gestion des Produits ==========

    @GetMapping("/produits")
    public ResponseEntity<List<Produit>> getAllProduits() {
        return ResponseEntity.ok(adminService.getAllProduits());
    }

    @PostMapping("/produits")
    public ResponseEntity<Produit> createProduit(@RequestBody Produit produit) {
        return ResponseEntity.ok(adminService.createProduit(produit));
    }

    @PutMapping("/produits/{id}")
    public ResponseEntity<Produit> updateProduit(@PathVariable Long id, @RequestBody Produit produit) {
        return ResponseEntity.ok(adminService.updateProduit(id, produit));
    }

    @PutMapping("/produits/{id}/stock")
    public ResponseEntity<MessageResponse> updateStock(@PathVariable Long id, @RequestParam Integer quantite) {
        MessageResponse response = adminService.updateStock(id, quantite);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    @DeleteMapping("/produits/{id}")
    public ResponseEntity<Void> deleteProduit(@PathVariable Long id) {
        adminService.deleteProduit(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Statistiques ==========

    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistiques() {
        return ResponseEntity.ok(adminService.getStatistiques());
    }
}
