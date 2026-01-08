package com.monsite.ventes.gestion_ventes.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Table(name = "vendeur_produits")
@Data
@EqualsAndHashCode(exclude = {"vendeur", "produit"})
@ToString(exclude = {"vendeur", "produit"})
@NoArgsConstructor
@AllArgsConstructor
public class VendeurProduit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendeur_id", nullable = false)
    @JsonIgnoreProperties({"vendeurProduits", "hibernateLazyInitializer", "handler", "motDePasse", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired"})
    private Vendeur vendeur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id", nullable = false)
    @JsonIgnoreProperties({"vendeurProduits", "hibernateLazyInitializer", "handler"})
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
