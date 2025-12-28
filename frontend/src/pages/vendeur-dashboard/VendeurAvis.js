import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiThumbsUp, FiThumbsDown, FiEye, FiEyeOff } from 'react-icons/fi';
import './VendeurDashboard.css';

const VendeurAvis = () => {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('all'); // all, positif, negatif, cache

  useEffect(() => {
    fetchAvis();
  }, []);

  const fetchAvis = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vendeur/avis');
      setAvis(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des avis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibilite = async (avisId) => {
    try {
      const response = await api.put(`/vendeur/avis/${avisId}/toggle-visibilite`);
      if (response.data.success) {
        setMessage({ type: 'success', text: response.data.message });
        fetchAvis();
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la modification' });
    }
  };

  const renderStars = (note) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              color: star <= note ? '#ffc107' : '#ddd',
              fontSize: '16px'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAvis = avis.filter(a => {
    switch (filter) {
      case 'positif':
        return a.estPositif === true;
      case 'negatif':
        return a.estPositif === false;
      case 'cache':
        return a.estCache === true;
      case 'visible':
        return a.estCache === false;
      default:
        return true;
    }
  });

  const stats = {
    total: avis.length,
    positifs: avis.filter(a => a.estPositif).length,
    negatifs: avis.filter(a => !a.estPositif).length,
    caches: avis.filter(a => a.estCache).length
  };

  if (loading) {
    return <div className="vendeur-loading">Chargement...</div>;
  }

  return (
    <div className="vendeur-avis-container">
      <div className="vendeur-header">
        <h1>Gestion des Avis</h1>
        <p>Consultez et gérez les avis de vos clients</p>
      </div>

      {message.text && (
        <div className={`vendeur-alert vendeur-alert-${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}

      {error && <div className="vendeur-alert vendeur-alert-error">{error}</div>}

      {/* Statistiques */}
      <div className="vendeur-stats-grid">
        <div className="vendeur-stat-card">
          <div className="vendeur-stat-value">{stats.total}</div>
          <div className="vendeur-stat-label">Total avis</div>
        </div>
        <div className="vendeur-stat-card" style={{ borderLeft: '4px solid #28a745' }}>
          <div className="vendeur-stat-value" style={{ color: '#28a745' }}>{stats.positifs}</div>
          <div className="vendeur-stat-label">Avis positifs</div>
        </div>
        <div className="vendeur-stat-card" style={{ borderLeft: '4px solid #dc3545' }}>
          <div className="vendeur-stat-value" style={{ color: '#dc3545' }}>{stats.negatifs}</div>
          <div className="vendeur-stat-label">Avis négatifs</div>
        </div>
        <div className="vendeur-stat-card" style={{ borderLeft: '4px solid #6c757d' }}>
          <div className="vendeur-stat-value" style={{ color: '#6c757d' }}>{stats.caches}</div>
          <div className="vendeur-stat-label">Avis masqués</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="vendeur-filters">
        <button
          className={`vendeur-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tous ({stats.total})
        </button>
        <button
          className={`vendeur-filter-btn ${filter === 'positif' ? 'active' : ''}`}
          onClick={() => setFilter('positif')}
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <FiThumbsUp size={14} /> Positifs ({stats.positifs})
        </button>
        <button
          className={`vendeur-filter-btn ${filter === 'negatif' ? 'active' : ''}`}
          onClick={() => setFilter('negatif')}
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <FiThumbsDown size={14} /> Négatifs ({stats.negatifs})
        </button>
        <button
          className={`vendeur-filter-btn ${filter === 'visible' ? 'active' : ''}`}
          onClick={() => setFilter('visible')}
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <FiEye size={14} /> Visibles
        </button>
        <button
          className={`vendeur-filter-btn ${filter === 'cache' ? 'active' : ''}`}
          onClick={() => setFilter('cache')}
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <FiEyeOff size={14} /> Masqués ({stats.caches})
        </button>
      </div>

      {/* Liste des avis */}
      {filteredAvis.length === 0 ? (
        <div className="vendeur-empty">
          <p>Aucun avis trouvé</p>
        </div>
      ) : (
        <div className="vendeur-avis-list">
          {filteredAvis.map((review) => (
            <div
              key={review.id}
              className={`vendeur-avis-card ${review.estCache ? 'hidden' : ''}`}
            >
              <div className="vendeur-avis-header">
                <div className="vendeur-avis-client">
                  <div className="vendeur-avis-avatar">
                    {review.clientNom?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="vendeur-avis-client-name">{review.clientNom}</div>
                    <div className="vendeur-avis-date">{formatDate(review.dateAvis)}</div>
                  </div>
                </div>
                <div className="vendeur-avis-meta">
                  {renderStars(review.note)}
                  <span className={`vendeur-avis-sentiment ${review.estPositif ? 'positif' : 'negatif'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {review.estPositif ? <><FiThumbsUp size={12} /> Positif</> : <><FiThumbsDown size={12} /> Négatif</>}
                  </span>
                  {review.estCache && (
                    <span className="vendeur-avis-hidden-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiEyeOff size={12} /> Masqué
                    </span>
                  )}
                </div>
              </div>

              <div className="vendeur-avis-product">
                <strong>Produit:</strong> {review.produitTitre}
              </div>

              {review.commentaire && (
                <div className="vendeur-avis-comment">
                  "{review.commentaire}"
                </div>
              )}

              <div className="vendeur-avis-actions">
                <button
                  className={`vendeur-btn ${review.estCache ? 'vendeur-btn-success' : 'vendeur-btn-warning'}`}
                  onClick={() => handleToggleVisibilite(review.id)}
                >
                  {review.estCache ? 'Afficher' : 'Masquer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendeurAvis;
