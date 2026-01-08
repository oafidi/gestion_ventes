import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import vendeurProduitService from '../../services/vendeurProduitService';
import { BACKEND_URL } from '../../config/apiConfig';

const VendeurMesProduits = () => {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('tous');
  const navigate = useNavigate();

  const fetchMesProduits = async () => {
    try {
      setLoading(true);
      const data = await vendeurProduitService.getMesProduits();
      setProduits(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement de vos produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesProduits();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  const formatPrice = (prix) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(prix);
  };

  const filteredProduits = produits.filter(p => {
    if (filterStatus === 'tous') return true;
    if (filterStatus === 'approuves') return p.estApprouve;
    if (filterStatus === 'attente') return !p.estApprouve;
    return true;
  });

  if (loading) {
    return (
      <div className="vendeur-content">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement de vos produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vendeur-content">
      <div className="page-header">
        <h2>Mes Produits</h2>
        <div className="header-stats">
          <span className="stat-badge approved">
            {produits.filter(p => p.estApprouve).length} approuvés
          </span>
          <span className="stat-badge pending">
            {produits.filter(p => !p.estApprouve).length} en attente
          </span>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
          </svg>
          {error}
        </div>
      )}

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filterStatus === 'tous' ? 'active' : ''}`}
          onClick={() => setFilterStatus('tous')}
        >
          Tous ({produits.length})
        </button>
        <button 
          className={`filter-tab ${filterStatus === 'approuves' ? 'active' : ''}`}
          onClick={() => setFilterStatus('approuves')}
        >
          Approuvés ({produits.filter(p => p.estApprouve).length})
        </button>
        <button 
          className={`filter-tab ${filterStatus === 'attente' ? 'active' : ''}`}
          onClick={() => setFilterStatus('attente')}
        >
          En attente ({produits.filter(p => !p.estApprouve).length})
        </button>
      </div>

      {filteredProduits.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path>
          </svg>
          <h3>Aucun produit</h3>
          <p>Vous n'avez pas encore inscrit de produit à commercialiser</p>
        </div>
      ) : (
        <div className="mes-produits-grid">
          {filteredProduits.map(produit => (
            <div key={produit.id} className="mon-produit-card">
              <div className="produit-image">
                {produit.image ? (
                  <img src={getImageUrl(produit.image)} alt={produit.titre} />
                ) : (
                  <div className="produit-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path>
                    </svg>
                  </div>
                )}
                <div className={`status-overlay ${produit.estApprouve ? 'approved' : 'pending'}`}>
                  {produit.estApprouve ? 'Approuvé' : 'En attente'}
                </div>
              </div>
              <div className="produit-details">
                <h3>{produit.titre}</h3>
                <p className="produit-nom-original">Produit: {produit.produitNom}</p>
                {produit.categorieNom && (
                  <span className="categorie-badge">{produit.categorieNom}</span>
                )}
                <div className="prix-container">
                  <div className="prix-info">
                    <span className="prix-label">Prix original:</span>
                    <span className="prix-original">{formatPrice(produit.prixOriginal)}</span>
                  </div>
                  <div className="prix-info">
                    <span className="prix-label">Votre prix:</span>
                    <span className="prix-vendeur">{formatPrice(produit.prixVendeur)}</span>
                  </div>
                  <div className="prix-info marge">
                    <span className="prix-label">Marge:</span>
                    <span className="prix-marge">
                      {formatPrice(produit.prixVendeur - produit.prixOriginal)}
                    </span>
                  </div>
                </div>
                {produit.description && (
                  <p className="produit-description">{produit.description}</p>
                )}
                <div className="produit-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => navigate(`/vendeur/dashboard/modifier-produit/${produit.id}`)}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                    </svg>
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendeurMesProduits;
