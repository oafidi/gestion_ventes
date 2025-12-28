package com.monsite.ventes.gestion_ventes.controller;

import com.monsite.ventes.gestion_ventes.entity.Categorie;
import com.monsite.ventes.gestion_ventes.repository.CategorieRepository;
import com.monsite.ventes.gestion_ventes.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/categories")
public class CategorieController {

    private final CategorieRepository categorieRepository;
    private final FileStorageService fileStorageService;

    public CategorieController(CategorieRepository categorieRepository, FileStorageService fileStorageService) {
        this.categorieRepository = categorieRepository;
        this.fileStorageService = fileStorageService;
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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Categorie> createCategorie(
            @RequestParam("nom") String nom,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        Categorie categorie = new Categorie();
        categorie.setNom(nom);
        
        if (image != null && !image.isEmpty()) {
            String imagePath = fileStorageService.storeFile(image);
            categorie.setImage(imagePath);
        }
        
        Categorie savedCategorie = categorieRepository.save(categorie);
        return ResponseEntity.ok(savedCategorie);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Categorie> updateCategorie(
            @PathVariable Long id,
            @RequestParam("nom") String nom,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return categorieRepository.findById(id)
                .map(existingCategorie -> {
                    existingCategorie.setNom(nom);
                    
                    if (image != null && !image.isEmpty()) {
                        // Supprimer l'ancienne image
                        if (existingCategorie.getImage() != null) {
                            fileStorageService.deleteFile(existingCategorie.getImage());
                        }
                        // Sauvegarder la nouvelle image
                        String imagePath = fileStorageService.storeFile(image);
                        existingCategorie.setImage(imagePath);
                    }
                    
                    return ResponseEntity.ok(categorieRepository.save(existingCategorie));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategorie(@PathVariable Long id) {
        return categorieRepository.findById(id)
                .map(categorie -> {
                    // Supprimer l'image associée
                    if (categorie.getImage() != null) {
                        fileStorageService.deleteFile(categorie.getImage());
                    }
                    categorieRepository.delete(categorie);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String filePath = fileStorageService.storeFile(file);
        Map<String, String> response = new HashMap<>();
        response.put("path", filePath);
        return ResponseEntity.ok(response);
    }
}
