import axios from 'axios';
import { API_URL, AI_SERVICE_URL } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Envoyer les cookies avec les requêtes
});

// API pour le service AI (recherche sémantique)
const aiApi = axios.create({
  baseURL: AI_SERVICE_URL,
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
    const response = await api.get('/client/debug');
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

  // ========== Panier ==========

  // Récupérer le panier du client (authentifié)
  getPanier: async () => {
    const response = await api.get('/client/panier');
    return response.data;
  },

  // Ajouter un produit au panier (authentifié)
  ajouterAuPanier: async (vendeurProduitId, quantite = 1) => {
    const response = await api.post('/client/panier/ajouter', {
      vendeurProduitId,
      quantite
    });
    return response.data;
  },

  // Modifier la quantité d'un produit dans le panier (authentifié)
  modifierQuantitePanier: async (vendeurProduitId, quantite) => {
    const response = await api.put('/client/panier/modifier', {
      vendeurProduitId,
      quantite
    });
    return response.data;
  },

  // Supprimer un produit du panier (authentifié)
  supprimerDuPanier: async (vendeurProduitId) => {
    const response = await api.delete(`/client/panier/produit/${vendeurProduitId}`);
    return response.data;
  },

  // Vider le panier (authentifié)
  viderPanier: async () => {
    const response = await api.delete('/client/panier/vider');
    return response.data;
  },

  // ========== Profil Client ==========

  // Mettre à jour le profil du client (authentifié)
  updateProfil: async (profilData) => {
    const response = await api.put('/client/profil', profilData);
    return response.data;
  },

  // Récupérer le profil du client (authentifié)
  getProfil: async () => {
    const response = await api.get('/client/profil');
    return response.data;
  },

  // ========== Recherche Sémantique AI ==========

  // Recherche sémantique de produits avec langage naturel
  rechercheSemantiqueTexte: async (query) => {
    try {
      const response = await aiApi.post('/products/get_products_text', { query });
      return response.data; // { ids: [id1, id2, ...] }
    } catch (error) {
      console.error('Erreur recherche sémantique:', error);
      return { ids: [] };
    }
  },

  // Convertir une URL d'image locale en chemin WSL pour le service AI Linux
  convertToWSLPath: (imageUrl) => {
    // Chemin de base WSL du projet
    const wslBasePath = '/mnt/c/Users/omar1/Downloads/gestion-ventes/gestion-ventes';
    
    // Si c'est une URL locale du serveur (http://localhost:8080/uploads/...)
    if (imageUrl.includes('localhost:8080/uploads/') || imageUrl.includes('127.0.0.1:8080/uploads/')) {
      const uploadPath = imageUrl.split('/uploads/')[1];
      return `${wslBasePath}/uploads/${uploadPath}`;
    }
    
    // Si c'est un chemin relatif (/uploads/...)
    if (imageUrl.startsWith('/uploads/')) {
      return `${wslBasePath}${imageUrl}`;
    }
    
    // Sinon retourner tel quel (URL externe)
    return imageUrl;
  },

  // Recherche sémantique par image
  rechercheSemantiqueImage: async (imageUrl) => {
    try {
      // Convertir l'URL en chemin WSL si c'est une image locale
      const wslPath = storeService.convertToWSLPath(imageUrl);
      console.log('Recherche par image - URL originale:', imageUrl);
      console.log('Recherche par image - Chemin WSL:', wslPath);
      
      const response = await aiApi.post('/products/get_products_image', { query: wslPath });
      return response.data; // { ids: [id1, id2, ...] }
    } catch (error) {
      console.error('Erreur recherche par image:', error);
      return { ids: [] };
    }
  },

  // Recherche sémantique et récupération des produits complets
  rechercheSemantiqueComplete: async (query) => {
    try {
      // 1. Obtenir les IDs depuis le service AI
      const aiResponse = await aiApi.post('/products/get_products_text', { query });
      const productIds = aiResponse.data.ids || [];
      
      if (productIds.length === 0) {
        return [];
      }

      // 2. Récupérer les détails des produits depuis le backend Spring
      const allProducts = await api.get('/vendeur-produits/approuves');
      
      // 3. Filtrer pour ne garder que les produits trouvés par l'AI
      const foundProducts = allProducts.data.filter(product => 
        productIds.includes(String(product.id))
      );

      // 4. Trier selon l'ordre de pertinence retourné par l'AI
      foundProducts.sort((a, b) => {
        return productIds.indexOf(String(a.id)) - productIds.indexOf(String(b.id));
      });

      return foundProducts;
    } catch (error) {
      console.error('Erreur recherche sémantique complète:', error);
      return [];
    }
  },

  // ========== Recommandations ==========

  // Vérifier si le client a des commandes
  hasOrders: async () => {
    try {
      const response = await api.get('/client/has-orders');
      return response.data;
    } catch (error) {
      console.error('Erreur vérification commandes:', error);
      return false;
    }
  },

  // Récupérer les produits recommandés pour le client connecté
  getRecommendations: async (maxSimilarClients = 3) => {
    try {
      const response = await api.get(`/client/recommendations?maxSimilarClients=${maxSimilarClients}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération recommandations:', error);
      return [];
    }
  },
};

export default storeService;
