package com.monsite.ventes.gestion_ventes.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "avis")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Avis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    @JsonIgnoreProperties({"commandes", "avis", "hibernateLazyInitializer", "handler"})
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendeur_produit_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private VendeurProduit vendeurProduit;

    @Column(nullable = false)
    private Integer note; // 1 à 5

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @Column(nullable = false)
    private LocalDateTime dateAvis = LocalDateTime.now();

    @Column(nullable = false)
    private Boolean estPositif = true; // Déterminé par analyse du commentaire

    @Column(nullable = false)
    private Boolean estCache = false; // Si true, l'avis n'est pas affiché
}
