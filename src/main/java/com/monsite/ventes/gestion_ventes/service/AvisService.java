package com.monsite.ventes.gestion_ventes.service;

import com.monsite.ventes.gestion_ventes.dto.AvisRequest;
import com.monsite.ventes.gestion_ventes.dto.AvisResponse;
import com.monsite.ventes.gestion_ventes.dto.MessageResponse;
import com.monsite.ventes.gestion_ventes.entity.Avis;
import com.monsite.ventes.gestion_ventes.entity.Client;
import com.monsite.ventes.gestion_ventes.entity.VendeurProduit;
import com.monsite.ventes.gestion_ventes.repository.AvisRepository;
import com.monsite.ventes.gestion_ventes.repository.ClientRepository;
import com.monsite.ventes.gestion_ventes.repository.VendeurProduitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AvisService {

    private final AvisRepository avisRepository;
    private final ClientRepository clientRepository;
    private final VendeurProduitRepository vendeurProduitRepository;

    // Lexique de mots positifs et négatifs pour l'analyse de sentiment
    private static final List<String> MOTS_POSITIFS = Arrays.asList(
        "excellent", "super", "génial", "parfait", "magnifique", "formidable", "incroyable",
        "fantastique", "merveilleux", "exceptionnel", "top", "bien", "bon", "beau", "belle",
        "qualité", "satisfait", "content", "heureux", "recommande", "adore", "aime", "love",
        "bravo", "merci", "rapide", "efficace", "professionnel", "meilleur", "great", "good",
        "amazing", "awesome", "wonderful", "nice", "beautiful", "happy", "perfect", "best"
    );

    private static final List<String> MOTS_NEGATIFS = Arrays.asList(
        "mauvais", "nul", "horrible", "terrible", "décevant", "déçu", "problème", "probleme",
        "défectueux", "cassé", "abîmé", "arnaque", "faux", "fake", "lent", "long", "retard",
        "jamais", "pire", "éviter", "rembourser", "remboursement", "médiocre", "passable",
        "bad", "worst", "terrible", "awful", "poor", "disappointed", "broken", "scam",
        "hate", "never", "slow", "late", "refund", "return", "horrible", "useless"
    );

    public AvisService(AvisRepository avisRepository, 
                       ClientRepository clientRepository,
                       VendeurProduitRepository vendeurProduitRepository) {
        this.avisRepository = avisRepository;
        this.clientRepository = clientRepository;
        this.vendeurProduitRepository = vendeurProduitRepository;
    }

    @Transactional
    public MessageResponse ajouterAvis(Long clientId, AvisRequest request) {
        // Vérifier si le client existe
        Client client = clientRepository.findById(clientId)
                .orElse(null);
        if (client == null) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Client non trouvé")
                    .build();
        }

        // Vérifier si le produit existe
        VendeurProduit vendeurProduit = vendeurProduitRepository.findById(request.getVendeurProduitId())
                .orElse(null);
        if (vendeurProduit == null) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Produit non trouvé")
                    .build();
        }

        // Vérifier si le client a déjà donné un avis sur ce produit
        if (avisRepository.existsByClientIdAndVendeurProduitId(clientId, request.getVendeurProduitId())) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Vous avez déjà donné un avis sur ce produit")
                    .build();
        }

        // Analyser le sentiment du commentaire
        boolean estPositif = analyserSentiment(request.getCommentaire(), request.getNote());

        // Créer l'avis
        Avis avis = new Avis();
        avis.setClient(client);
        avis.setVendeurProduit(vendeurProduit);
        avis.setNote(request.getNote());
        avis.setCommentaire(request.getCommentaire());
        avis.setDateAvis(LocalDateTime.now());
        avis.setEstPositif(estPositif);
        avis.setEstCache(false);

        avisRepository.save(avis);

        return MessageResponse.builder()
                .success(true)
                .message("Avis ajouté avec succès")
                .build();
    }

    public List<AvisResponse> getAvisParProduit(Long vendeurProduitId) {
        return avisRepository.findByVendeurProduitIdAndNotHidden(vendeurProduitId).stream()
                .map(this::toAvisResponse)
                .collect(Collectors.toList());
    }

    public List<AvisResponse> getAvisParVendeur(Long vendeurId) {
        return avisRepository.findByVendeurId(vendeurId).stream()
                .map(this::toAvisResponse)
                .collect(Collectors.toList());
    }

    public Double getMoyenneNotes(Long vendeurProduitId) {
        Double moyenne = avisRepository.getAverageNoteByVendeurProduitId(vendeurProduitId);
        return moyenne != null ? Math.round(moyenne * 10.0) / 10.0 : 0.0;
    }

    public Long getNombreAvis(Long vendeurProduitId) {
        return avisRepository.countByVendeurProduitId(vendeurProduitId);
    }

    @Transactional
    public MessageResponse toggleVisibiliteAvis(Long vendeurId, Long avisId) {
        Avis avis = avisRepository.findById(avisId)
                .orElse(null);
        
        if (avis == null) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Avis non trouvé")
                    .build();
        }

        // Vérifier que l'avis appartient à un produit du vendeur
        if (!avis.getVendeurProduit().getVendeur().getId().equals(vendeurId)) {
            return MessageResponse.builder()
                    .success(false)
                    .message("Vous n'êtes pas autorisé à modifier cet avis")
                    .build();
        }

        // Toggle la visibilité
        avis.setEstCache(!avis.getEstCache());
        avisRepository.save(avis);

        String message = avis.getEstCache() ? "Avis masqué" : "Avis affiché";
        return MessageResponse.builder()
                .success(true)
                .message(message)
                .build();
    }

    /**
     * Analyse le sentiment d'un commentaire en utilisant un lexique de mots
     * Combine l'analyse textuelle avec la note donnée
     */
    private boolean analyserSentiment(String commentaire, Integer note) {
        // Si pas de commentaire, se baser uniquement sur la note
        if (commentaire == null || commentaire.trim().isEmpty()) {
            return note >= 3;
        }

        String commentaireLower = commentaire.toLowerCase();
        
        int scorePositif = 0;
        int scoreNegatif = 0;

        // Compter les mots positifs
        for (String mot : MOTS_POSITIFS) {
            if (commentaireLower.contains(mot)) {
                scorePositif++;
            }
        }

        // Compter les mots négatifs
        for (String mot : MOTS_NEGATIFS) {
            if (commentaireLower.contains(mot)) {
                scoreNegatif++;
            }
        }

        // Combiner l'analyse textuelle avec la note
        // La note a un poids plus important
        int scoreFinal = (scorePositif - scoreNegatif) + (note - 3) * 2;
        
        return scoreFinal >= 0;
    }

    private AvisResponse toAvisResponse(Avis avis) {
        return AvisResponse.builder()
                .id(avis.getId())
                .clientId(avis.getClient().getId())
                .clientNom(avis.getClient().getNom())
                .vendeurProduitId(avis.getVendeurProduit().getId())
                .produitTitre(avis.getVendeurProduit().getTitre())
                .note(avis.getNote())
                .commentaire(avis.getCommentaire())
                .dateAvis(avis.getDateAvis())
                .estPositif(avis.getEstPositif())
                .estCache(avis.getEstCache())
                .build();
    }
}
