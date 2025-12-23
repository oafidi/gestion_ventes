# Gestion Ventes - Frontend React

Application frontend React pour la gestion des ventes.

## Prérequis

- Node.js 18+ 
- npm ou yarn

## Installation

1. Installer les dépendances :
```bash
cd frontend
npm install
```

2. Démarrer l'application en mode développement :
```bash
npm start
```

L'application sera accessible sur http://localhost:3000

## Fonctionnalités

- ✅ Page de connexion Admin
- ✅ Tableau de bord avec statistiques
- ✅ Gestion des produits
- ✅ Gestion des catégories
- ✅ Gestion des vendeurs
- ✅ Gestion des commandes

## Structure du projet

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── PrivateRoute.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Login.css
│   │   ├── Dashboard.js
│   │   └── Dashboard.css
│   ├── services/
│   │   ├── api.js
│   │   └── authService.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

## Configuration

L'API backend doit être accessible sur `http://localhost:8080`

## Scripts disponibles

- `npm start` - Démarre le serveur de développement
- `npm build` - Build pour la production
- `npm test` - Lance les tests
