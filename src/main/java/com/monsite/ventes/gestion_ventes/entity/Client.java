package com.monsite.ventes.gestion_ventes.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clients")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Client extends Utilisateur {

    @Column(nullable = false)
    private String adresseLivraison;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Commande> commandes = new ArrayList<>();

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Avis> avis = new ArrayList<>();

    public Client(Long id, String nom, String email, String motDePasse, String telephone, String adresseLivraison) {
        super(id, nom, email, motDePasse, telephone, Role.CLIENT);
        this.adresseLivraison = adresseLivraison;
    }

    public void passerCommande() {
        // Logique pour passer une commande
    }

    public void ajouterAvis() {
        // Logique pour ajouter un avis
    }
}
