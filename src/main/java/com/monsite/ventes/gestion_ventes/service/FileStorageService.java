package com.monsite.ventes.gestion_ventes.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path baseUploadDir;

    public FileStorageService() {
        // Dossier d'upload de base dans le répertoire du projet
        this.baseUploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.baseUploadDir);
            Files.createDirectories(this.baseUploadDir.resolve("categories"));
            Files.createDirectories(this.baseUploadDir.resolve("produits"));
            Files.createDirectories(this.baseUploadDir.resolve("vendeur-produits"));
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer les dossiers d'upload", e);
        }
    }

    public String storeFile(MultipartFile file) {
        return storeFile(file, "categories");
    }

    public String storeFile(MultipartFile file, String subFolder) {
        try {
            // Créer le sous-dossier s'il n'existe pas
            Path uploadDir = this.baseUploadDir.resolve(subFolder);
            Files.createDirectories(uploadDir);

            // Générer un nom unique pour éviter les conflits
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;

            // Copier le fichier
            Path targetLocation = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Retourner le chemin relatif pour stockage en base
            return "/uploads/" + subFolder + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors du stockage du fichier", e);
        }
    }

    public void deleteFile(String filePath) {
        if (filePath != null && filePath.startsWith("/uploads/")) {
            try {
                String relativePath = filePath.substring("/uploads/".length());
                Path targetLocation = this.baseUploadDir.resolve(relativePath);
                Files.deleteIfExists(targetLocation);
            } catch (IOException e) {
                System.err.println("Erreur lors de la suppression du fichier: " + e.getMessage());
            }
        }
    }

    public Path getUploadDir() {
        return baseUploadDir;
    }
}
