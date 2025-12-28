import api from './api';

// Export nommé pour getAllVendeurs
export const getAllVendeurs = async () => {
  const response = await api.get('/admin/vendeurs');
  return response.data;
};

const vendeurService = {
  // Récupérer tous les vendeurs
  getAllVendeurs: async () => {
    const response = await api.get('/admin/vendeurs');
    const vendeurs = response.data;
    return {
      enAttente: vendeurs.filter(v => !v.estApprouve),
      approuves: vendeurs.filter(v => v.estApprouve),
      tous: vendeurs
    };
  },

  // Récupérer les vendeurs en attente d'approbation
  getVendeursEnAttente: async () => {
    const response = await api.get('/admin/vendeurs/en-attente');
    return response.data;
  },

  // Récupérer les vendeurs approuvés
  getVendeursApprouves: async () => {
    const response = await api.get('/admin/vendeurs/approuves');
    return response.data;
  },

  // Approuver un vendeur
  approuverVendeur: async (id) => {
    const response = await api.post(`/admin/vendeurs/${id}/approuver`);
    return response.data;
  },

  // Bannir un vendeur (le désapprouver)
  bannirVendeur: async (id) => {
    const response = await api.post(`/admin/vendeurs/${id}/bannir`);
    return response.data;
  },

  // Rejeter/Supprimer un vendeur
  rejeterVendeur: async (id) => {
    const response = await api.delete(`/admin/vendeurs/${id}/rejeter`);
    return response.data;
  }
};

export default vendeurService;
