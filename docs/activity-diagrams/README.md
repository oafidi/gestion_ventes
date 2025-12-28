# 📊 Diagrammes d'Activités - Système de Gestion des Ventes

## 📋 Vue d'ensemble

Ce dossier contient l'ensemble des **diagrammes d'activités métier** du système de gestion des ventes. Ces diagrammes décrivent les flux de travail et les processus métier de l'application.

---

## 🎯 Objectifs des diagrammes

- Modéliser les **flux de travail** complets
- Illustrer les **décisions** et **branchements** dans les processus
- Documenter les **actions parallèles** (fork/join)
- Montrer les **swimlanes** (couloirs) par acteur

---

## 📑 Liste des diagrammes

### 🔐 Authentification et Accès
| N° | Diagramme | Description |
|----|-----------|-------------|
| DA01 | [Authentification](DA01-Authentification.puml) | Inscription, connexion avec gestion des rôles |

### 🛒 Processus Client
| N° | Diagramme | Description |
|----|-----------|-------------|
| DA02 | [Processus Commande](DA02-ProcessusCommande.puml) | De la navigation à la confirmation d'achat |
| DA06 | [Gestion Avis](DA06-GestionAvis.puml) | Évaluation des produits par les clients |
| DA08 | [Navigation Boutique](DA08-NavigationBoutique.puml) | Parcours de recherche et achat |
| DA12 | [Suivi Commande Client](DA12-SuiviCommandeClient.puml) | Historique et suivi des commandes |

### 🏪 Processus Vendeur
| N° | Diagramme | Description |
|----|-----------|-------------|
| DA04 | [Inscription Produit](DA04-InscriptionProduitVendeur.puml) | Soumission d'une offre produit |
| DA11 | [Espace Vendeur](DA11-EspaceVendeur.puml) | Gestion quotidienne du vendeur |

### 🛡️ Processus Administration
| N° | Diagramme | Description |
|----|-----------|-------------|
| DA03 | [Traitement Commandes](DA03-TraitementCommandeAdmin.puml) | Gestion du cycle de vie des commandes |
| DA05 | [Approbation](DA05-ApprobationVendeursOffres.puml) | Validation des vendeurs et offres |
| DA07 | [Gestion Catalogue](DA07-GestionCatalogueAdmin.puml) | Administration des produits et stock |
| DA10 | [Gestion Catégories](DA10-GestionCategories.puml) | Organisation du catalogue |
| DA13 | [Statistiques](DA13-StatistiquesAdmin.puml) | Tableau de bord analytique |

### 🔄 Processus Transversaux
| N° | Diagramme | Description |
|----|-----------|-------------|
| DA09 | [Cycle Vie Commande](DA09-CycleVieCommande.puml) | États et transitions d'une commande |

---

## 👥 Acteurs (Swimlanes)

Les diagrammes utilisent des **couloirs (swimlanes)** pour identifier les responsabilités :

| Couleur | Acteur | Icône |
|---------|--------|-------|
| 🟠 Orange clair | Client | 🛒 |
| 🟣 Violet clair | Vendeur | 🏪 |
| 🟢 Vert clair | Administrateur | 🛡️ |
| 🔵 Bleu clair | Système | 📊 |

---

## 🔄 Éléments de notation

### Symboles d'activité
| Symbole | Description |
|---------|-------------|
| ● | Point de départ |
| ◉ | Point de fin |
| ▭ | Action / Activité |
| ◇ | Décision (if/switch) |
| ═══ | Fork / Join (parallélisme) |

### Indicateurs visuels
| Indicateur | Signification |
|------------|---------------|
| ✅ | Succès / Validation |
| ❌ | Échec / Erreur |
| ⚠️ | Avertissement |
| 📧 | Notification email |
| 🔴🟡🟢 | Niveaux d'alerte |

---

## 🔗 Correspondance avec les Diagrammes de Séquence

Chaque diagramme d'activité correspond à un ou plusieurs diagrammes de séquence :

| Diagramme d'Activité | Diagramme(s) de Séquence |
|----------------------|--------------------------|
| DA01 - Authentification | DS01 - Authentification |
| DA02 - Processus Commande | DS02 - Passer Commande |
| DA03 - Traitement Commandes | DS03 - Gestion Commande Admin |
| DA04 - Inscription Produit | DS04 - Inscrire Produit Vendeur |
| DA05 - Approbation | DS05 - Approbation Admin |
| DA06 - Gestion Avis | DS06 - Ajouter Avis |
| DA07 - Gestion Catalogue | DS07 - CRUD Produits Admin |
| DA08 - Navigation Boutique | DS08 - Consultation Catalogue |
| DA09 - Cycle Vie Commande | DS09 - Cycle Vie Commande |
| DA10 - Gestion Catégories | DS10 - Gestion Catégories |
| DA11 - Espace Vendeur | DS11 - Tableau de Bord Vendeur |
| DA12 - Suivi Commande | DS12 - Suivi Commande Client |
| DA13 - Statistiques | DS13 - Statistiques Admin |

---

## 🎨 Conventions visuelles

### Couleurs des décisions
- 🟢 **Vert** : Chemin de succès
- 🔴 **Rouge** : Chemin d'erreur
- 🟡 **Jaune** : En attente / Attention

### Notes explicatives
- Encadrés jaunes : Informations affichées à l'utilisateur
- Encadrés verts : Données créées/modifiées
- Encadrés roses : Alertes et erreurs

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

## ✨ Points clés pour la soutenance

1. **Swimlanes** : Responsabilités clairement identifiées par acteur
2. **Décisions** : Branchements avec conditions explicites
3. **Parallélisme** : Fork/Join pour les actions simultanées
4. **Boucles** : Repeat/while pour les processus itératifs
5. **Notes** : Données métier illustrées dans chaque étape

---

## 📐 Différence avec les Diagrammes de Séquence

| Aspect | Diagramme d'Activité | Diagramme de Séquence |
|--------|---------------------|----------------------|
| Focus | **Flux de travail** | **Interactions** |
| Temps | Non linéaire | Chronologique |
| Vue | Processus global | Messages entre objets |
| Parallélisme | Fork/Join explicites | Fragments combinés |
| Acteurs | Swimlanes | Lignes de vie |

---

## 📝 Auteur

Projet académique - Système de Gestion des Ventes

---

*Généré le 28/12/2024*
