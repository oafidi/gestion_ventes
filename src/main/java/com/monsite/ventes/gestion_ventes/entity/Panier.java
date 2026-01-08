package com.monsite.ventes.gestion_ventes.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "paniers")
@Data
@EqualsAndHashCode(exclude = {"client", "lignesPanier"})
@ToString(exclude = {"client", "lignesPanier"})
@NoArgsConstructor
@AllArgsConstructor
public class Panier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"panier", "commandes", "avis", "hibernateLazyInitializer", "handler", "motDePasse", "authorities"})
    private Client client;

    @OneToMany(mappedBy = "panier", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"panier", "hibernateLazyInitializer", "handler"})
    private List<LignePanier> lignesPanier = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime dateModification = LocalDateTime.now();

    /**
     * Calcule le montant total du panier
     */
    public BigDecimal getMontantTotal() {
        return lignesPanier.stream()
                .map(LignePanier::getSousTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Retourne le nombre total de produits dans le panier
     */
    public Integer getNombreProduits() {
        return lignesPanier.stream()
                .mapToInt(lp -> lp.getQuantite())
                .sum();
    }

    /**
     * Vide le panier
     */
    public void vider() {
        this.lignesPanier.clear();
        this.dateModification = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.dateModification = LocalDateTime.now();
    }
}
