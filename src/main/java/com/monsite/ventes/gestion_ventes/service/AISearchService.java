package com.monsite.ventes.gestion_ventes.service;

import com.monsite.ventes.gestion_ventes.entity.VendeurProduit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Service pour synchroniser les produits avec le service AI Python
 * pour la recherche sémantique.
 */
@Service
public class AISearchService {

    private static final Logger logger = LoggerFactory.getLogger(AISearchService.class);

    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://127.0.0.1:8000}")
    private String aiServiceUrl;

    @Value("${app.upload.dir:C:/Users/omar1/Downloads/gestion-ventes/gestion-ventes/uploads}")
    private String uploadDir;

    public AISearchService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Convertit un chemin d'image relatif en chemin WSL Linux absolu.
     * Ex: /uploads/image.jpg -> /mnt/c/Users/omar1/Downloads/gestion-ventes/gestion-ventes/uploads/image.jpg
     */
    private String convertToWSLPath(String imagePath) {
        if (imagePath == null || imagePath.isEmpty()) {
            return "";
        }
        
        // Le chemin de base Windows du projet
        String baseWindowsPath = "C:/Users/omar1/Downloads/gestion-ventes/gestion-ventes";
        
        // Convertir en chemin WSL
        // C:/ -> /mnt/c/
        String wslBasePath = "/mnt/c/Users/omar1/Downloads/gestion-ventes/gestion-ventes";
        
        // Si le chemin commence par /uploads, on ajoute le chemin de base WSL
        if (imagePath.startsWith("/uploads")) {
            return wslBasePath + imagePath;
        }
        
        // Si c'est déjà un chemin absolu Windows, le convertir
        if (imagePath.matches("^[A-Za-z]:.*")) {
            // Remplacer C: par /mnt/c et les \ par /
            String wslPath = imagePath.replaceFirst("^([A-Za-z]):", "/mnt/$1");
            wslPath = wslPath.replace("\\", "/").toLowerCase();
            // Corriger la lettre du lecteur en minuscule
            wslPath = wslPath.replaceFirst("/mnt/([A-Z])", "/mnt/" + imagePath.substring(0, 1).toLowerCase());
            return wslPath;
        }
        
        return imagePath;
    }

    /**
     * Synchronise un produit avec le service AI pour l'indexation sémantique.
     * Cette méthode est asynchrone pour ne pas bloquer le thread principal.
     */
    @Async
    public void syncProductWithAI(VendeurProduit vendeurProduit) {
        try {
            String url = aiServiceUrl + "/products/add_product";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> productData = new HashMap<>();
            productData.put("id", vendeurProduit.getId());
            productData.put("vendor_price", vendeurProduit.getPrixVendeur());
            productData.put("title", vendeurProduit.getTitre() != null ? 
                    vendeurProduit.getTitre() : vendeurProduit.getProduit().getNom());
            productData.put("description", vendeurProduit.getDescription() != null ? 
                    vendeurProduit.getDescription() : "");
            
            // Construire le chemin WSL de l'image pour le service AI Linux
            String imageWslPath = "";
            if (vendeurProduit.getImage() != null && !vendeurProduit.getImage().isEmpty()) {
                imageWslPath = convertToWSLPath(vendeurProduit.getImage());
                logger.debug("Chemin image converti: {} -> {}", vendeurProduit.getImage(), imageWslPath);
            }
            productData.put("img_url", imageWslPath);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(productData, headers);

            restTemplate.postForObject(url, request, String.class);
            
            logger.info("Produit {} synchronisé avec le service AI (image: {})", vendeurProduit.getId(), imageWslPath);
        } catch (Exception e) {
            logger.warn("Impossible de synchroniser le produit {} avec le service AI: {}", 
                    vendeurProduit.getId(), e.getMessage());
            // Ne pas propager l'exception pour ne pas affecter le flux principal
        }
    }

    /**
     * Synchronise tous les produits approuvés avec le service AI.
     */
    @Async
    public void syncAllApprovedProducts(Iterable<VendeurProduit> products) {
        for (VendeurProduit product : products) {
            if (product.isEstApprouve()) {
                syncProductWithAI(product);
            }
        }
    }
}
