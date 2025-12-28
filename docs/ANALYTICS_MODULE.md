# Module Analytics - Dashboard de Performance Commerciale

## Vue d'ensemble

Ce module fournit un dashboard analytique complet pour l'analyse des performances commerciales de la plateforme e-commerce. Il supporte deux rôles principaux :

- **ADMIN** : Vision globale multi-vendeurs et multi-catégories
- **VENDEUR** : Vision personnalisée de ses propres performances

## Architecture

### Backend (Spring Boot)

```
src/main/java/com/monsite/ventes/gestion_ventes/
├── dto/analytics/
│   ├── AnalyticsFilterRequest.java     # Filtres de recherche
│   ├── CategorieAnalyticsResponse.java # Stats par catégorie
│   ├── DashboardKPIResponse.java       # KPIs principaux
│   ├── ExportDataResponse.java         # Données d'export
│   ├── ProduitAnalyticsResponse.java   # Stats par produit
│   ├── RecommandationsResponse.java    # Insights intelligents
│   ├── VendeurAnalyticsResponse.java   # Stats par vendeur
│   └── VentesTendanceResponse.java     # Tendances temporelles
├── service/
│   └── AnalyticsService.java           # Logique métier analytics
└── controller/
    └── AnalyticsController.java        # API REST endpoints
```

### Frontend (React)

```
frontend/src/
├── components/analytics/
│   ├── AnalyticsComponents.js   # Composants UI réutilisables
│   ├── AnalyticsComponents.css  # Styles des composants
│   ├── AnalyticsCharts.js       # Graphiques (Recharts)
│   ├── AnalyticsCharts.css      # Styles des graphiques
│   └── index.js                 # Exports
├── pages/analytics/
│   ├── AdminAnalyticsDashboard.js    # Dashboard Admin
│   ├── VendeurAnalyticsDashboard.js  # Dashboard Vendeur
│   ├── AnalyticsDashboard.css        # Styles communs
│   └── index.js                      # Exports
├── services/
│   └── analyticsService.js      # Appels API analytics
└── utils/
    └── exportUtils.js           # Export CSV/Excel
```

## Fonctionnalités

### 1. KPIs Clés (Cards)
- Chiffre d'affaires total
- Nombre de commandes
- Produits vendus
- Panier moyen
- Taux de croissance (%)
- Note moyenne globale
- Nombre d'avis
- Vendeurs actifs (Admin)

### 2. Tendances de Ventes
- Courbe d'évolution temporelle
- Périodes : Jour / Semaine / Mois
- Comparaison période précédente
- Graphique combiné CA + Ventes

### 3. Analyse Produits
- Top 10 par ventes
- Top 10 par chiffre d'affaires
- Top 10 par note moyenne
- Tableau détaillé avec tri dynamique

### 4. Analyse Catégories
- Répartition CA par catégorie (Pie chart)
- Comparaison performances (Bar chart)
- Cards détaillées par catégorie
- Indicateur de potentiel

### 5. Analyse Vendeurs (Admin)
- Classement des vendeurs
- Performance comparative
- Statuts : TOP_PERFORMER, PERFORMANT, MOYEN, A_AMELIORER

### 6. Recommandations Intelligentes
- **Produits à fort potentiel** : Bien notés mais peu vendus
- **Produits à améliorer** : Vendus mais mal notés
- **Catégories tendance** : Opportunités de développement
- **Alertes** : Stock faible, baisse de performance

### 7. Filtres Avancés
- Période (date début / fin)
- Catégorie
- Vendeur (Admin)
- Prix min/max
- Note minimale
- Affichage : Jour/Semaine/Mois

### 8. Export des Données
- Format CSV
- Format Excel (XLSX)
- Export respectant les droits d'accès

## API Endpoints

### Admin
```
GET /api/analytics/admin/kpis
GET /api/analytics/admin/tendances
GET /api/analytics/admin/produits
GET /api/analytics/admin/categories
GET /api/analytics/admin/vendeurs
GET /api/analytics/admin/recommandations
GET /api/analytics/admin/export
```

### Vendeur
```
GET /api/analytics/vendeur/kpis
GET /api/analytics/vendeur/tendances
GET /api/analytics/vendeur/produits
GET /api/analytics/vendeur/categories
GET /api/analytics/vendeur/recommandations
GET /api/analytics/vendeur/export
```

## Dépendances Frontend

```json
{
  "recharts": "^3.6.0",
  "date-fns": "^4.1.0",
  "file-saver": "^2.0.5",
  "xlsx": "^0.18.5",
  "react-icons": "^5.5.0"
}
```

## Accès

- **Admin** : `/dashboard/analytics`
- **Vendeur** : `/vendeur/dashboard/analytics`

## Design

- Style moderne type SaaS
- Responsive (desktop/tablet/mobile)
- Palette de couleurs cohérente
- Animations subtiles
- Dark-friendly (préparé pour dark mode)

## Bonnes Pratiques

1. **Séparation des couches** : Data / Business Logic / UI
2. **Composants modulaires** : Réutilisables et configurables
3. **Performance** : Lazy loading, pagination, caching
4. **Sécurité** : Filtrage par rôle côté serveur
5. **UX** : Loading states, error handling, empty states
