package com.monsite.ventes.gestion_ventes.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "admins")
@Data
@EqualsAndHashCode(callSuper = true)
public class Admin extends Utilisateur {

    public Admin() {
        super();
    }

    public Admin(Long id, String nom, String email, String motDePasse, String telephone) {
        super(id, nom, email, motDePasse, telephone, Role.ADMIN);
    }

    public void approuverVendeur() {
        // Logique d'approbation du vendeur
    }

    public void gererCategories() {
        // Logique de gestion des catégories
    }

    public void gererProduits() {
        // Logique de gestion des produits
    }

    public void gererStock() {
        // Logique de gestion du stock
    }

    public void voirCommandes() {
        // Logique pour voir les commandes
    }

    public void voirStatistiques() {
        // Logique pour voir les statistiques
    }
}
