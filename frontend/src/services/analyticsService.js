/**
 * Service d'analytics pour le dashboard
 * Gère les appels API pour les KPIs, tendances, analyses et recommandations
 */
import api from './api';

// ==================== ENDPOINTS ADMIN ====================

/**
 * Récupère les KPIs globaux (Admin)
 * @param {Object} filters - Filtres optionnels (dateDebut, dateFin, categorieId, vendeurId)
 */
export const getKPIsAdmin = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);
  if (filters.categorieId) params.append('categorieId', filters.categorieId);
  if (filters.vendeurId) params.append('vendeurId', filters.vendeurId);
  
  const response = await api.get(`/analytics/admin/kpis?${params.toString()}`);
  return response.data;
};

/**
 * Récupère les tendances de ventes (Admin)
 */
export const getTendancesAdmin = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);
  if (filters.typePeriode) params.append('typePeriode', filters.typePeriode);
  if (filters.vendeurId) params.append('vendeurId', filters.vendeurId);
  
  const response = await api.get(`/analytics/admin/tendances?${params.toString()}`);
  return response.data;
};

/**
 * Récupère l'analyse des produits (Admin)
 */
export const getProduitsAdmin = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);
  if (filters.categorieId) params.append('categorieId', filters.categorieId);
  if (filters.vendeurId) params.append('vendeurId', filters.vendeurId);
  if (filters.prixMin) params.append('prixMin', filters.prixMin);
  if (filters.prixMax) params.append('prixMax', filters.prixMax);
  if (filters.noteMinimale) params.append('noteMinimale', filters.noteMinimale);
  if (filters.triPar) params.append('triPar', filters.triPar);
  if (filters.ordre) params.append('ordre', filters.ordre);
  if (filters.estApprouve !== undefined) params.append('estApprouve', filters.estApprouve);
  
  const response = await api.get(`/analytics/admin/produits?${params.toString()}`);
  return response.data;
};

/**
 * Récupère l'analyse des catégories (Admin)
 */
export const getCategoriesAdmin = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);
  if (filters.vendeurId) params.append('vendeurId', filters.vendeurId);
  
  const response = await api.get(`/analytics/admin/categories?${params.toString()}`);
  return response.data;
};

/**
 * Récupère l'analyse des vendeurs (Admin uniquement)
 */
export const getVendeursAnalytics = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);
  
  const response = await api.get(`/analytics/admin/vendeurs?${params.toString()}`);
  return response.data;
};

/**
 * Récupère les recommandations (Admin)
 */
export const getRecommandationsAdmin = async () => {
  const response = await api.get('/analytics/admin/recommandations');
  return response.data;
};

/**
 * Prépare l'export des données (Admin)
 */
export const getExportAdmin = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);
  if (filters.categorieId) params.append('categorieId', filters.categorieId);
  if (filters.vendeurId) params.append('vendeurId', filters.vendeurId);
  
  const response = await api.get(`/analytics/admin/export?${params.toString()}`);
  return response.data;
};

// ==================== ENDPOINTS VENDEUR ====================

/**
 * Récupère les KPIs personnalisés (Vendeur)
 */
export const getKPIsVendeur = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);
  if (filters.categorieId) params.append('categorieId', filters.categorieId);
  
  const response = await api.get(`/analytics/vendeur/kpis?${params.toString()}`);
  return response.data;
};

/**
 * Récupère les tendances de ventes (Vendeur)
 */
export const getTendancesVendeur = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);
  if (filters.typePeriode) params.append('typePeriode', filters.typePeriode);
  
  const response = await api.get(`/analytics/vendeur/tendances?${params.toString()}`);
  return response.data;
};

/**
 * Récupère l'analyse des produits (Vendeur)
 */
export const getProduitsVendeur = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);
  if (filters.categorieId) params.append('categorieId', filters.categorieId);
  if (filters.prixMin) params.append('prixMin', filters.prixMin);
  if (filters.prixMax) params.append('prixMax', filters.prixMax);
  if (filters.noteMinimale) params.append('noteMinimale', filters.noteMinimale);
  if (filters.triPar) params.append('triPar', filters.triPar);
  if (filters.ordre) params.append('ordre', filters.ordre);
  if (filters.estApprouve !== undefined) params.append('estApprouve', filters.estApprouve);
  
  const response = await api.get(`/analytics/vendeur/produits?${params.toString()}`);
  return response.data;
};

/**
 * Récupère l'analyse des catégories (Vendeur)
 */
export const getCategoriesVendeur = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);
  
  const response = await api.get(`/analytics/vendeur/categories?${params.toString()}`);
  return response.data;
};

/**
 * Récupère les recommandations intelligentes (Vendeur)
 */
export const getRecommandationsVendeur = async () => {
  const response = await api.get('/analytics/vendeur/recommandations');
  return response.data;
};

/**
 * Récupère les commandes du vendeur (Vendeur)
 */
export const getCommandesVendeur = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.statut) params.append('statut', filters.statut);
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);
  
  const response = await api.get(`/analytics/vendeur/commandes?${params.toString()}`);
  return response.data;
};

/**
 * Prépare l'export des données (Vendeur)
 */
export const getExportVendeur = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
  if (filters.dateFin) params.append('dateFin', filters.dateFin);
  if (filters.categorieId) params.append('categorieId', filters.categorieId);
  
  const response = await api.get(`/analytics/vendeur/export?${params.toString()}`);
  return response.data;
};

// ==================== UTILITAIRES ====================

/**
 * Formate un nombre en devise (MAD - Dirham Marocain)
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0,00 DH';
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + ' DH';
};

/**
 * Formate un pourcentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

/**
 * Formate une date en français
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

/**
 * Obtient les dates par défaut pour les filtres (30 derniers jours)
 */
export const getDefaultDateRange = () => {
  const dateFin = new Date();
  const dateDebut = new Date();
  dateDebut.setDate(dateDebut.getDate() - 30);
  
  return {
    dateDebut: dateDebut.toISOString().split('T')[0],
    dateFin: dateFin.toISOString().split('T')[0]
  };
};

/**
 * Export des données en CSV
 */
export const exportToCSV = (data, filename) => {
  if (!data || !data.produits) return;
  
  const headers = [
    'Produit',
    'Catégorie',
    'Vendeur',
    'Prix',
    'Ventes',
    'CA',
    'Note',
    'Reviews',
    'Stock'
  ];
  
  const rows = data.produits.map(p => [
    p.titre || p.nomProduit,
    p.categorieNom,
    p.vendeurNom,
    p.prixVendeur,
    p.nombreVentes,
    p.chiffreAffaires,
    p.noteMoyenne?.toFixed(2) || 'N/A',
    p.nombreReviews,
    p.quantiteStock
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};
