package com.monsite.ventes.gestion_ventes.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vendeurs")
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"vendeurProduits"})
@ToString(exclude = {"vendeurProduits"})
@NoArgsConstructor
@AllArgsConstructor
public class Vendeur extends Utilisateur {

    @Column(nullable = false)
    private boolean estApprouve = false;

    @JsonIgnore
    @OneToMany(mappedBy = "vendeur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VendeurProduit> vendeurProduits = new ArrayList<>();

    public Vendeur(Long id, String nom, String email, String motDePasse, String telephone, boolean estApprouve) {
        super(id, nom, email, motDePasse, telephone, Role.VENDEUR);
        this.estApprouve = estApprouve;
    }

    @Override
    public boolean isEnabled() {
        return estApprouve;
    }

    public void commercialiserProduit() {
        // Logique pour commercialiser un produit
    }

    public void voirCommandes() {
        // Logique pour voir les commandes
    }
}
