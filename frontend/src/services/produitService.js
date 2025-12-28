import api from './api';

const produitService = {
  // Récupérer tous les produits
  getAllProduits: async () => {
    const response = await api.get('/produits');
    return response.data;
  },

  // Récupérer un produit par ID
  getProduitById: async (id) => {
    const response = await api.get(`/produits/${id}`);
    return response.data;
  },

  // Récupérer les produits par catégorie
  getProduitsByCategorie: async (categorieId) => {
    const response = await api.get(`/produits/categorie/${categorieId}`);
    return response.data;
  },

  // Rechercher des produits
  searchProduits: async (nom) => {
    const response = await api.get(`/produits/search?nom=${encodeURIComponent(nom)}`);
    return response.data;
  },

  // Créer un nouveau produit
  createProduit: async (nom, description, prix, quantite, categorieId, imageFile) => {
    const formData = new FormData();
    formData.append('nom', nom);
    if (description) formData.append('description', description);
    formData.append('prix', prix);
    formData.append('quantite', quantite);
    if (categorieId) formData.append('categorieId', categorieId);
    if (imageFile) formData.append('image', imageFile);

    const response = await api.post('/produits', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Mettre à jour un produit
  updateProduit: async (id, nom, description, prix, quantite, categorieId, imageFile) => {
    const formData = new FormData();
    formData.append('nom', nom);
    if (description) formData.append('description', description);
    formData.append('prix', prix);
    formData.append('quantite', quantite);
    if (categorieId) formData.append('categorieId', categorieId);
    if (imageFile) formData.append('image', imageFile);

    const response = await api.put(`/produits/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Supprimer un produit
  deleteProduit: async (id) => {
    const response = await api.delete(`/produits/${id}`);
    return response.data;
  }
};

export default produitService;
