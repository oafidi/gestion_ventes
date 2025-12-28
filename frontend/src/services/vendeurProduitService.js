import api from './api';

const vendeurProduitService = {
  // Récupérer mes produits (en tant que vendeur)
  getMesProduits: async () => {
    const response = await api.get('/vendeur/mes-produits');
    return response.data;
  },

  // Récupérer un produit spécifique
  getMonProduit: async (id) => {
    const response = await api.get(`/vendeur/mes-produits/${id}`);
    return response.data;
  },

  // S'inscrire à un produit pour le commercialiser
  inscrireProduit: async (produitId, prixVendeur, titre, description, image) => {
    const response = await api.post('/vendeur/produits/inscrire', {
      produitId,
      prixVendeur,
      titre,
      description,
      image
    });
    return response.data;
  },

  // Modifier un produit vendeur (avec image)
  modifierProduit: async (id, titre, prixVendeur, description, imageFile) => {
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('prixVendeur', prixVendeur);
    if (description) formData.append('description', description);
    if (imageFile) formData.append('image', imageFile);

    const response = await api.put(`/vendeur/mes-produits/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Modifier un produit vendeur (sans nouvelle image)
  modifierProduitJson: async (id, titre, prixVendeur, description, imagePath) => {
    const response = await api.put(`/vendeur/mes-produits/${id}/json`, {
      produitId: 0, // Non utilisé pour la modification
      prixVendeur,
      titre,
      description,
      image: imagePath
    });
    return response.data;
  },

  // Récupérer tous les produits disponibles
  getProduitsDisponibles: async () => {
    const response = await api.get('/produits');
    return response.data;
  },

  // Admin: Récupérer toutes les inscriptions
  getAllInscriptions: async () => {
    const response = await api.get('/admin/vendeur-produits');
    return response.data;
  },

  // Admin: Récupérer les inscriptions en attente
  getInscriptionsEnAttente: async () => {
    const response = await api.get('/admin/vendeur-produits/en-attente');
    return response.data;
  },

  // Admin: Récupérer les inscriptions approuvées
  getInscriptionsApprouvees: async () => {
    const response = await api.get('/admin/vendeur-produits/approuves');
    return response.data;
  },

  // Admin: Approuver une inscription
  approuverInscription: async (id) => {
    const response = await api.post(`/admin/vendeur-produits/${id}/approuver`);
    return response.data;
  },

  // Admin: Bannir une inscription (la désapprouver)
  bannirInscription: async (id) => {
    const response = await api.post(`/admin/vendeur-produits/${id}/bannir`);
    return response.data;
  },

  // Admin: Rejeter/Supprimer une inscription
  rejeterInscription: async (id) => {
    const response = await api.delete(`/admin/vendeur-produits/${id}/rejeter`);
    return response.data;
  }
};

export default vendeurProduitService;
