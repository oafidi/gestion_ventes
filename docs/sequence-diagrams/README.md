# 📊 Diagrammes de Séquence - Système de Gestion des Ventes

## 📋 Vue d'ensemble

Ce dossier contient l'ensemble des **diagrammes de séquence métier** du système de gestion des ventes en ligne. Ces diagrammes décrivent les interactions entre les différents acteurs (Client, Vendeur, Administrateur) et les objets métier du système.

---

## 🎯 Objectifs des diagrammes

- Modéliser les **processus métier** de l'application
- Illustrer les **interactions** entre acteurs et objets
- Documenter les **règles de gestion** du système
- Servir de **référence** pour le développement

---

## 📑 Liste des diagrammes

### 🔐 Authentification et Accès
| N° | Diagramme | Description |
|----|-----------|-------------|
| DS01 | [Authentification](DS01-Authentification.puml) | Inscription, connexion et déconnexion des utilisateurs |

### 🛒 Processus Client
| N° | Diagramme | Description |
|----|-----------|-------------|
| DS02 | [Passer Commande](DS02-PasserCommande.puml) | Ajout au panier et validation de commande |
| DS06 | [Ajouter Avis](DS06-AjouterAvis.puml) | Évaluation des produits par les clients |
| DS08 | [Consultation Catalogue](DS08-ConsultationCatalogue.puml) | Navigation et recherche de produits |
| DS12 | [Suivi Commande Client](DS12-SuiviCommandeClient.puml) | Historique et suivi des commandes |

### 🏪 Processus Vendeur
| N° | Diagramme | Description |
|----|-----------|-------------|
| DS04 | [Inscrire Produit](DS04-InscrireProduitVendeur.puml) | Soumission d'une offre produit |
| DS11 | [Tableau de Bord Vendeur](DS11-TableauBordVendeur.puml) | Gestion de l'activité commerciale |

### 🛡️ Processus Administration
| N° | Diagramme | Description |
|----|-----------|-------------|
| DS03 | [Gestion Commandes](DS03-GestionCommandeAdmin.puml) | Suivi et traitement des commandes |
| DS05 | [Approbation Admin](DS05-ApprobationAdmin.puml) | Validation des vendeurs et offres |
| DS07 | [CRUD Produits](DS07-CRUDProduitsAdmin.puml) | Gestion du catalogue produits |
| DS10 | [Gestion Catégories](DS10-GestionCategories.puml) | Organisation du catalogue |
| DS13 | [Statistiques Admin](DS13-StatistiquesAdmin.puml) | Tableau de bord analytique |

### 🔄 Processus Transversaux
| N° | Diagramme | Description |
|----|-----------|-------------|
| DS09 | [Cycle de Vie Commande](DS09-CycleVieCommande.puml) | États et transitions d'une commande |

---

## 👥 Acteurs du système

| Acteur | Icône | Description |
|--------|-------|-------------|
| **Client** | 🛒 | Utilisateur qui achète des produits |
| **Vendeur** | 🏪 | Utilisateur qui propose des produits à la vente |
| **Administrateur** | 🛡️ | Gestionnaire de la plateforme |
| **Visiteur** | 👁️ | Utilisateur non connecté |

---

## 📦 Objets métier principaux

| Objet | Description |
|-------|-------------|
| **Commande** | Représente un achat client avec ses lignes |
| **Produit** | Article du catalogue central |
| **VendeurProduit** | Offre d'un vendeur sur un produit |
| **Categorie** | Classification des produits |
| **Avis** | Évaluation d'un produit par un client |

---

## 🔄 États des entités

### Statuts de Commande
```
🟡 EN_ATTENTE → 🟢 CONFIRMÉE → 🔵 EN_COURS_LIVRAISON → ✅ LIVRÉE
                    ↓                                      
                ❌ ANNULÉE
```

### Statuts Vendeur
```
⏳ En attente d'approbation → ✅ Approuvé
                            → ❌ Rejeté
```

### Statuts Offre (VendeurProduit)
```
⏳ En attente → ✅ Approuvée (visible en boutique)
              → ❌ Rejetée
```

---

## 🎨 Conventions visuelles

### Couleurs des acteurs
- 🟠 **Orange** : Client/Visiteur
- 🟣 **Violet** : Vendeur
- 🟢 **Vert** : Administrateur

### Couleurs des notes
- 🔵 **Bleu clair** : Objectif métier
- 🟡 **Jaune** : Informations affichées
- 🟢 **Vert** : Succès / Validation
- 🔴 **Rouge** : Erreur / Échec

### Symboles
- ✅ Succès
- ❌ Échec
- ⚠️ Avertissement
- 📧 Notification email
- ⭐ Évaluation

---

## 🛠️ Comment visualiser les diagrammes

### Option 1 : PlantUML en ligne
1. Aller sur [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)
2. Copier-coller le contenu du fichier `.puml`
3. Le diagramme se génère automatiquement

### Option 2 : Extension VS Code
1. Installer l'extension "PlantUML"
2. Ouvrir un fichier `.puml`
3. Utiliser `Alt+D` pour prévisualiser

### Option 3 : IntelliJ IDEA
1. Installer le plugin "PlantUML Integration"
2. Ouvrir le fichier `.puml`
3. Le diagramme s'affiche dans le panneau de prévisualisation

---

## 📐 Correspondance avec le Diagramme de Classes

Les diagrammes de séquence utilisent les objets définis dans le [Diagramme de Classes](../DiagrammeDeClasses-Simple.puml) :

| Classe UML | Représentation dans les DS |
|------------|---------------------------|
| `Utilisateur` | Acteurs (Client, Vendeur, Admin) |
| `Commande` | Participant "📋 Commande" |
| `LigneCommande` | Inclus dans les détails de commande |
| `Produit` | Participant "📦 Produit" |
| `VendeurProduit` | Participant "📦 Offre Vendeur" |
| `Categorie` | Participant "📂 Catégorie" |
| `Avis` | Participant "⭐ Avis" |

---

## ✨ Points clés pour la soutenance

1. **Architecture orientée métier** : Les diagrammes se concentrent sur les processus business, pas sur la technique
2. **Scénarios alternatifs** : Chaque diagramme inclut les cas d'erreur (blocs `alt`)
3. **Règles de gestion** : Les contraintes métier sont documentées dans les notes
4. **Cohérence** : Les objets correspondent au diagramme de classes
5. **Traçabilité** : Chaque cas d'utilisation est couvert par un diagramme

---

## 📝 Auteur

Projet académique - Système de Gestion des Ventes

---

*Généré le 28/12/2024*
