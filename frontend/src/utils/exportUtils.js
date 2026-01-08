/**
 * Utilitaires pour l'export des données analytiques
 * Supporte CSV et Excel (XLSX)
 */

/**
 * Export des données en CSV
 * @param {Array} data - Données à exporter
 * @param {string} filename - Nom du fichier
 * @param {Array} headers - En-têtes des colonnes (optionnel)
 */
export const exportToCSV = (data, filename, headers = null) => {
  if (!data || data.length === 0) {
    console.warn('Aucune donnée à exporter');
    return;
  }

  // Générer les en-têtes si non fournis
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Convertir les données en lignes CSV
  const csvRows = data.map(row => 
    csvHeaders.map(header => {
      const value = row[header];
      // Échapper les guillemets et encadrer les valeurs contenant des virgules
      if (value === null || value === undefined) return '';
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    }).join(',')
  );

  // Assembler le CSV
  const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
  
  // Créer et télécharger le fichier
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}_${getDateString()}.csv`);
};

/**
 * Export des données en Excel (XLSX)
 * Nécessite la bibliothèque xlsx
 * @param {Object} exportData - Données à exporter
 * @param {string} filename - Nom du fichier
 */
export const exportToExcel = async (exportData, filename) => {
  try {
    const XLSX = await import('xlsx');
    
    const workbook = XLSX.utils.book_new();
    
    // Feuille KPIs
    if (exportData.kpis) {
      const kpisData = [
        ['Indicateur', 'Valeur'],
        ['Chiffre d\'affaires total', formatCurrency(exportData.kpis.chiffreAffairesTotal)],
        ['Nombre de ventes', exportData.kpis.nombreTotalVentes],
        ['Produits vendus', exportData.kpis.nombreProduitsVendus],
        ['Panier moyen', formatCurrency(exportData.kpis.prixMoyenCommande)],
        ['Croissance', `${exportData.kpis.tauxCroissanceVentes?.toFixed(1) || 0}%`],
        ['Note moyenne', exportData.kpis.noteMoyenneGlobale?.toFixed(2) || 'N/A'],
        ['Nombre d\'avis', exportData.kpis.nombreTotalReviews]
      ];
      const kpisSheet = XLSX.utils.aoa_to_sheet(kpisData);
      XLSX.utils.book_append_sheet(workbook, kpisSheet, 'KPIs');
    }
    
    // Feuille Produits
    if (exportData.produits && exportData.produits.length > 0) {
      const produitsHeaders = [
        'Produit', 'Catégorie', 'Vendeur', 'Prix', 'Ventes', 'CA', 'Note', 'Avis', 'Stock', 'Statut'
      ];
      const produitsData = exportData.produits.map(p => [
        p.titre || p.nomProduit,
        p.categorieNom,
        p.vendeurNom,
        p.prixVendeur,
        p.nombreVentes,
        p.chiffreAffaires,
        p.noteMoyenne?.toFixed(2) || 'N/A',
        p.nombreReviews,
        p.quantiteStock,
        p.estApprouve ? 'Approuvé' : 'En attente'
      ]);
      const produitsSheet = XLSX.utils.aoa_to_sheet([produitsHeaders, ...produitsData]);
      XLSX.utils.book_append_sheet(workbook, produitsSheet, 'Produits');
    }
    
    // Feuille Catégories
    if (exportData.categories && exportData.categories.length > 0) {
      const categoriesHeaders = [
        'Catégorie', 'CA', 'Ventes', 'Produits', 'Prix moyen', '% CA', 'Performance'
      ];
      const categoriesData = exportData.categories.map(c => [
        c.categorieNom,
        c.chiffreAffaires,
        c.nombreVentes,
        c.nombreProduits,
        c.prixMoyen,
        `${c.pourcentageCA?.toFixed(1) || 0}%`,
        c.performance
      ]);
      const categoriesSheet = XLSX.utils.aoa_to_sheet([categoriesHeaders, ...categoriesData]);
      XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Catégories');
    }
    
    // Feuille Résumé
    if (exportData.resumeAnalytique) {
      const resumeSheet = XLSX.utils.aoa_to_sheet([
        ['RAPPORT ANALYTIQUE'],
        ['Date d\'export', new Date().toLocaleString('fr-FR')],
        [''],
        [exportData.resumeAnalytique]
      ]);
      XLSX.utils.book_append_sheet(workbook, resumeSheet, 'Résumé');
    }
    
    // Télécharger le fichier
    XLSX.writeFile(workbook, `${filename}_${getDateString()}.xlsx`);
    
  } catch (error) {
    console.error('Erreur export Excel:', error);
    // Fallback vers CSV
    if (exportData.produits) {
      exportToCSV(exportData.produits, filename);
    }
  }
};

/**
 * Export des produits en format simplifié
 */
export const exportProduitsCSV = (produits, filename = 'produits') => {
  if (!produits || produits.length === 0) return;
  
  const data = produits.map(p => ({
    Produit: p.titre || p.nomProduit,
    Catégorie: p.categorieNom,
    Vendeur: p.vendeurNom,
    Prix: p.prixVendeur,
    Ventes: p.nombreVentes,
    CA: p.chiffreAffaires,
    Note: p.noteMoyenne?.toFixed(2) || 'N/A',
    Avis: p.nombreReviews,
    Stock: p.quantiteStock
  }));
  
  exportToCSV(data, filename, Object.keys(data[0]));
};

// ==================== HELPERS ====================

const downloadBlob = (blob, filename) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const getDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0 DH';
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD'
  }).format(value);
};

export default {
  exportToCSV,
  exportToExcel,
  exportProduitsCSV
};
