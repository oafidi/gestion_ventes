import api from './api';

// Export nommé pour getAllCategories
export const getAllCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

const categorieService = {
  // Récupérer toutes les catégories
  getAllCategories,

  // Récupérer une catégorie par ID
  getCategorieById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Créer une nouvelle catégorie avec fichier
  createCategorie: async (nom, imageFile) => {
    const formData = new FormData();
    formData.append('nom', nom);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const response = await api.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Mettre à jour une catégorie avec fichier
  updateCategorie: async (id, nom, imageFile) => {
    const formData = new FormData();
    formData.append('nom', nom);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const response = await api.put(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Supprimer une catégorie
  deleteCategorie: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export default categorieService;
