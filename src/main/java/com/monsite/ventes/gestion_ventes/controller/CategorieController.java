package com.monsite.ventes.gestion_ventes.controller;

import com.monsite.ventes.gestion_ventes.entity.Categorie;
import com.monsite.ventes.gestion_ventes.repository.CategorieRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategorieController {

    private final CategorieRepository categorieRepository;

    public CategorieController(CategorieRepository categorieRepository) {
        this.categorieRepository = categorieRepository;
    }

    @GetMapping
    public ResponseEntity<List<Categorie>> getAllCategories() {
        return ResponseEntity.ok(categorieRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Categorie> getCategorieById(@PathVariable Long id) {
        return categorieRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
