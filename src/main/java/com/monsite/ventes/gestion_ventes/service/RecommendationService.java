package com.monsite.ventes.gestion_ventes.service;

import com.monsite.ventes.gestion_ventes.dto.VendeurProduitResponse;
import com.monsite.ventes.gestion_ventes.entity.VendeurProduit;
import com.monsite.ventes.gestion_ventes.repository.CommandeRepository;
import com.monsite.ventes.gestion_ventes.repository.LigneCommandeRepository;
import com.monsite.ventes.gestion_ventes.repository.VendeurProduitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de recommandation basé sur le filtrage collaboratif.
 * Utilise le service AI Python pour trouver les clients similaires.
 */
@Service
public class RecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationService.class);

    private final RestTemplate restTemplate;
    private final CommandeRepository commandeRepository;
    private final VendeurProduitRepository vendeurProduitRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Value("${ai.service.url:http://127.0.0.1:8000}")
    private String aiServiceUrl;

    public RecommendationService(RestTemplate restTemplate,
                                  CommandeRepository commandeRepository,
                                  VendeurProduitRepository vendeurProduitRepository) {
        this.restTemplate = restTemplate;
        this.commandeRepository = commandeRepository;
        this.vendeurProduitRepository = vendeurProduitRepository;
    }

    /**
     * Vérifie si le client a déjà passé une commande.
     */
    public boolean clientHasOrders(Long clientId) {
        return commandeRepository.existsByClientId(clientId);
    }

    /**
     * Récupère les données de filtrage collaboratif depuis la base de données.
     * Format: { client_id: [...], categorie: [...], score: [...] }
     */
    @SuppressWarnings("unchecked")
    public Map<String, List<Object>> getCollaborativeFilteringData() {
        String sql = """
            SELECT 
                co.client_id,
                ca.nom AS categorie,
                CAST(SUM(lc.quantite) AS SIGNED) AS score
            FROM lignes_commande lc
            INNER JOIN commandes co 
                ON lc.commande_id = co.id
            INNER JOIN vendeur_produits vp
                ON lc.vendeur_produit_id = vp.id
            INNER JOIN produits pr
                ON pr.id = vp.produit_id
            INNER JOIN categories ca
                ON pr.categorie_id = ca.id
            GROUP BY co.client_id, ca.nom
            """;

        List<Object[]> results = entityManager.createNativeQuery(sql).getResultList();

        List<Object> clientIds = new ArrayList<>();
        List<Object> categories = new ArrayList<>();
        List<Object> scores = new ArrayList<>();

        for (Object[] row : results) {
            clientIds.add(((Number) row[0]).longValue());
            categories.add((String) row[1]);
            scores.add(((Number) row[2]).intValue());
        }

        Map<String, List<Object>> data = new HashMap<>();
        data.put("client_id", clientIds);
        data.put("categorie", categories);
        data.put("score", scores);

        return data;
    }

    /**
     * Appelle le service AI pour obtenir les clients similaires.
     */
    @SuppressWarnings("unchecked")
    public List<Long> getSimilarClients(Long clientId, int k) {
        try {
            Map<String, List<Object>> collabData = getCollaborativeFilteringData();
            
            // Vérifier si le client existe dans les données
            if (!collabData.get("client_id").contains(clientId)) {
                logger.info("Client {} n'a pas de données de filtrage collaboratif", clientId);
                return Collections.emptyList();
            }

            String url = aiServiceUrl + "/collaborative_filtering";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("collab_filtered_data", collabData);
            requestBody.put("client_id", clientId);
            requestBody.put("k", k);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            
            if (response != null && response.containsKey("similiar_clients_ids")) {
                List<Number> similarIds = (List<Number>) response.get("similiar_clients_ids");
                return similarIds.stream()
                        .map(Number::longValue)
                        .collect(Collectors.toList());
            }

            return Collections.emptyList();
        } catch (Exception e) {
            logger.warn("Erreur lors de l'appel au service AI de filtrage collaboratif: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Récupère les produits recommandés pour un client.
     * Ce sont les produits achetés par les clients similaires mais pas encore par notre client.
     */
    @SuppressWarnings("unchecked")
    public List<VendeurProduitResponse> getRecommendedProducts(Long clientId, int maxSimilarClients) {
        // 1. Obtenir les clients similaires
        List<Long> similarClients = getSimilarClients(clientId, maxSimilarClients);
        
        if (similarClients.isEmpty()) {
            logger.info("Aucun client similaire trouvé pour le client {}", clientId);
            return Collections.emptyList();
        }

        logger.info("Clients similaires pour {}: {}", clientId, similarClients);

        // 2. Récupérer les produits que les clients similaires ont achetés mais pas notre client
        String sql = """
            SELECT DISTINCT vp.id
            FROM lignes_commande lc
            INNER JOIN commandes co 
                ON lc.commande_id = co.id
            INNER JOIN vendeur_produits vp
                ON vp.id = lc.vendeur_produit_id
            WHERE co.client_id IN (:similarClientIds)
            AND vp.est_approuve = true
            AND NOT EXISTS (
                SELECT 1
                FROM lignes_commande lc2
                INNER JOIN commandes co2 
                    ON lc2.commande_id = co2.id
                WHERE co2.client_id = :clientId
                AND lc2.vendeur_produit_id = vp.id
            )
            """;

        List<Object> results = entityManager.createNativeQuery(sql)
                .setParameter("similarClientIds", similarClients)
                .setParameter("clientId", clientId)
                .getResultList();

        List<Long> recommendedProductIds = results.stream()
                .map(id -> ((Number) id).longValue())
                .collect(Collectors.toList());

        if (recommendedProductIds.isEmpty()) {
            logger.info("Aucun produit recommandé trouvé pour le client {}", clientId);
            return Collections.emptyList();
        }

        logger.info("Produits recommandés pour {}: {}", clientId, recommendedProductIds);

        // 3. Récupérer les détails des produits
        List<VendeurProduit> products = vendeurProduitRepository.findAllById(recommendedProductIds);
        
        return products.stream()
                .filter(VendeurProduit::isEstApprouve)
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convertit un VendeurProduit en VendeurProduitResponse.
     */
    private VendeurProduitResponse convertToResponse(VendeurProduit vp) {
        VendeurProduitResponse response = new VendeurProduitResponse();
        response.setId(vp.getId());
        response.setProduitId(vp.getProduit().getId());
        response.setProduitNom(vp.getProduit().getNom());
        response.setVendeurId(vp.getVendeur().getId());
        response.setVendeurNom(vp.getVendeur().getNom());
        response.setPrixVendeur(vp.getPrixVendeur());
        response.setPrixOriginal(vp.getProduit().getPrix());
        response.setEstApprouve(vp.isEstApprouve());
        response.setImage(vp.getImage());
        response.setTitre(vp.getTitre());
        response.setDescription(vp.getDescription());
        if (vp.getProduit().getCategorie() != null) {
            response.setCategorieId(vp.getProduit().getCategorie().getId());
            response.setCategorieNom(vp.getProduit().getCategorie().getNom());
        }
        return response;
    }
}
