import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import vendeurProduitService from '../../services/vendeurProduitService';
import categorieService from '../../services/categorieService';

const API_BASE_URL = 'http://localhost:8080';

const VendeurInscrireProduit = () => {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    prixVendeur: ''
  });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [produitsData, categoriesData] = await Promise.all([
        vendeurProduitService.getProduitsDisponibles(),
        categorieService.getAllCategories()
      ]);
      setProduits(produitsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  const formatPrice = (prix) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(prix);
  };

  const handleSelectProduit = (produit) => {
    setSelectedProduit(produit);
    setFormData({
      titre: produit.nom,
      description: '',
      prixVendeur: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduit(null);
    setFormData({ titre: '', description: '', prixVendeur: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    const prixVendeur = parseFloat(formData.prixVendeur);
    if (isNaN(prixVendeur) || prixVendeur <= selectedProduit.prix) {
      setError(`Le prix vendeur doit être supérieur au prix original (${formatPrice(selectedProduit.prix)})`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await vendeurProduitService.inscrireProduit(
        selectedProduit.id,
        prixVendeur,
        formData.titre,
        formData.description,
        null // pas d'image pour l'instant
      );

      if (response.success) {
        setSuccess(response.message);
        handleCloseModal();
        setTimeout(() => {
          navigate('/vendeur/dashboard/mes-produits');
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProduits = produits.filter(produit => {
    const matchesSearch = produit.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategorie = !filterCategorie || produit.categorie?.id?.toString() === filterCategorie;
    return matchesSearch && matchesCategorie;
  });

  if (loading) {
    return (
      <div className="vendeur-content">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des produits disponibles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vendeur-content">
      <div className="page-header">
        <h2>Inscrire un Produit</h2>
        <p className="page-subtitle">Choisissez un produit à commercialiser</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
          </svg>
          {error}
          <button className="alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
          </svg>
          {success}
        </div>
      )}

      <div className="produits-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
            </svg>
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={filterCategorie}
            onChange={(e) => setFilterCategorie(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nom}</option>
            ))}
          </select>
        </div>
        <div className="produits-count">
          {filteredProduits.length} produit(s) disponible(s)
        </div>
      </div>

      {filteredProduits.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path>
          </svg>
          <h3>Aucun produit trouvé</h3>
          <p>Modifiez vos critères de recherche</p>
        </div>
      ) : (
        <div className="produits-catalogue-grid">
          {filteredProduits.map(produit => (
            <div key={produit.id} className="produit-catalogue-card">
              <div className="catalogue-image">
                {produit.image ? (
                  <img src={getImageUrl(produit.image)} alt={produit.nom} />
                ) : (
                  <div className="catalogue-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className="catalogue-content">
                <h3>{produit.nom}</h3>
                {produit.categorie && (
                  <span className="categorie-badge">{produit.categorie.nom}</span>
                )}
                <p className="catalogue-description">
                  {produit.description?.substring(0, 80)}
                  {produit.description?.length > 80 ? '...' : ''}
                </p>
                <div className="catalogue-footer">
                  <span className="catalogue-prix">{formatPrice(produit.prix)}</span>
                  <button 
                    className="btn-inscrire"
                    onClick={() => handleSelectProduit(produit)}
                  >
                    S'inscrire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'inscription */}
      {showModal && selectedProduit && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>S'inscrire pour commercialiser</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
              </button>
            </div>
            
            <div className="selected-produit-info">
              <div className="selected-produit-image">
                {selectedProduit.image ? (
                  <img src={getImageUrl(selectedProduit.image)} alt={selectedProduit.nom} />
                ) : (
                  <div className="catalogue-placeholder small">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className="selected-produit-details">
                <h4>{selectedProduit.nom}</h4>
                <p className="prix-original-info">
                  Prix original: <strong>{formatPrice(selectedProduit.prix)}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="titre">Titre de votre offre *</label>
                <input
                  type="text"
                  id="titre"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Ex: Offre spéciale - Livraison gratuite"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prixVendeur">Votre prix de vente (€) *</label>
                <input
                  type="number"
                  id="prixVendeur"
                  value={formData.prixVendeur}
                  onChange={(e) => setFormData({ ...formData, prixVendeur: e.target.value })}
                  placeholder={`Minimum: ${(parseFloat(selectedProduit.prix) + 0.01).toFixed(2)}`}
                  step="0.01"
                  min={parseFloat(selectedProduit.prix) + 0.01}
                  required
                />
                <small className="form-help">
                  Doit être supérieur au prix original ({formatPrice(selectedProduit.prix)}). 
                  La différence sera votre marge.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description de votre offre</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez les avantages de votre offre..."
                  rows="3"
                />
              </div>

              <div className="info-box">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
                </svg>
                <p>Votre inscription sera soumise à l'approbation de l'administrateur avant d'être visible aux clients.</p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Inscription...' : 'S\'inscrire'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendeurInscrireProduit;
