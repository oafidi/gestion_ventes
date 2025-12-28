import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes (optionnel pour le store)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('=== Axios Interceptor ===');
    console.log('URL:', config.url);
    console.log('Token trouvé:', token ? 'OUI' : 'NON');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Header Authorization ajouté:', config.headers.Authorization.substring(0, 50) + '...');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const storeService = {
  // Récupérer toutes les catégories
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Récupérer une catégorie par ID
  getCategorieById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Récupérer tous les produits vendeurs approuvés
  getProduitsApprouves: async () => {
    const response = await api.get('/vendeur-produits/approuves');
    return response.data;
  },

  // Récupérer un produit vendeur par ID
  getProduitById: async (id) => {
    const response = await api.get(`/vendeur-produits/approuves/${id}`);
    return response.data;
  },

  // Passer une commande (authentifié)
  passerCommande: async (commandeData) => {
    const response = await api.post('/client/commandes', commandeData);
    return response.data;
  },

  // Récupérer mes commandes (authentifié)
  getMesCommandes: async () => {
    const response = await api.get('/client/commandes');
    return response.data;
  },

  // Récupérer une commande par ID (authentifié)
  getCommandeById: async (id) => {
    const response = await api.get(`/client/commandes/${id}`);
    return response.data;
  },

  // Annuler une commande (authentifié)
  annulerCommande: async (id) => {
    const response = await api.post(`/client/commandes/${id}/annuler`);
    return response.data;
  },

  // Inscription client
  signupClient: async (userData) => {
    const response = await api.post('/auth/signup', {
      ...userData,
      role: 'CLIENT'
    });
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, motDePasse: password });
    return response.data;
  },

  // Debug - vérifier l'authentification actuelle
  debugAuth: async () => {
    const response = await api.get('/auth/debug');
    return response.data;
  },

  // ========== Avis ==========

  // Récupérer les avis d'un produit (public)
  getAvisProduit: async (vendeurProduitId) => {
    const response = await api.get(`/avis/produit/${vendeurProduitId}`);
    return response.data;
  },

  // Récupérer les statistiques d'avis d'un produit (public)
  getStatsAvis: async (vendeurProduitId) => {
    const response = await api.get(`/avis/produit/${vendeurProduitId}/stats`);
    return response.data;
  },

  // Ajouter un avis (authentifié)
  ajouterAvis: async (avisData) => {
    const response = await api.post('/avis', avisData);
    return response.data;
  },
};

export default storeService;
