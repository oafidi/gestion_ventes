package com.monsite.ventes.gestion_ventes.controller;

import com.monsite.ventes.gestion_ventes.dto.VendeurProduitResponse;
import com.monsite.ventes.gestion_ventes.service.VendeurProduitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendeur-produits")
public class VendeurProduitController {

    private final VendeurProduitService vendeurProduitService;

    public VendeurProduitController(VendeurProduitService vendeurProduitService) {
        this.vendeurProduitService = vendeurProduitService;
    }

    @GetMapping("/approuves")
    public ResponseEntity<List<VendeurProduitResponse>> getProduitsApprouves() {
        return ResponseEntity.ok(vendeurProduitService.getProduitsApprouves());
    }
}
