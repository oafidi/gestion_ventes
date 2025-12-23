package com.monsite.ventes.gestion_ventes.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "vendeur_produits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendeurProduit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendeur_id", nullable = false)
    private Vendeur vendeur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixVendeur;

    @Column
    private String image;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String titre;

    @Column(nullable = false)
    private boolean estApprouve = false;
}
