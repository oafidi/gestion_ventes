import React, { useState, useEffect } from 'react';
import vendeurService from '../../services/vendeurService';
import './Vendeurs.css';

const Vendeurs = () => {
  const [vendeurs, setVendeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendeur, setSelectedVendeur] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Charger les vendeurs
  const fetchVendeurs = async () => {
    try {
      setLoading(true);
      const vendeurData = await vendeurService.getAllVendeurs();
      setVendeurs(vendeurData.tous || []);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des vendeurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendeurs();
  }, []);

  // Approuver un vendeur
  const handleApprouverVendeur = async (id) => {
    try {
      await vendeurService.approuverVendeur(id);
      setSuccess('Vendeur approuvé avec succès');
      fetchVendeurs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erreur lors de l\'approbation');
    }
  };

  // Bannir un vendeur
  const handleBannirVendeur = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir bannir ce vendeur ? Il ne pourra plus vendre.')) {
      try {
        await vendeurService.bannirVendeur(id);
        setSuccess('Vendeur banni avec succès');
        fetchVendeurs();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('Erreur lors du bannissement');
      }
    }
  };

  // Supprimer un vendeur
  const handleSupprimerVendeur = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce vendeur ?')) {
      try {
        await vendeurService.rejeterVendeur(id);
        setSuccess('Vendeur supprimé');
        fetchVendeurs();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('Erreur lors de la suppression');
      }
    }
  };

  // Voir les détails d'un vendeur
  const handleVoirDetails = (vendeur) => {
    setSelectedVendeur(vendeur);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setSelectedVendeur(null);
    setShowDetailModal(false);
  };

  // Filtrer les vendeurs
  const filteredVendeurs = vendeurs.filter(v => {
    const matchesSearch = v.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         v.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'tous' || 
                         (filterStatus === 'approuves' && v.estApprouve) ||
                         (filterStatus === 'attente' && !v.estApprouve);
    return matchesSearch && matchesFilter;
  });

  // Compteurs
  const vendeursApprouves = vendeurs.filter(v => v.estApprouve).length;
  const vendeursEnAttente = vendeurs.filter(v => !v.estApprouve).length;

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <div>
          <h2>Gestion des Vendeurs</h2>
          <p className="page-subtitle">Gérez les comptes vendeurs de votre plateforme</p>
        </div>
        <div className="header-stats">
          <span className="stat-badge approved">{vendeursApprouves} actifs</span>
          <span className="stat-badge pending">{vendeursEnAttente} en attente</span>
        </div>
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

      {/* Toolbar */}
      <div className="vendeurs-toolbar">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterStatus === 'tous' ? 'active' : ''}`}
            onClick={() => setFilterStatus('tous')}
          >
            Tous ({vendeurs.length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'approuves' ? 'active' : ''}`}
            onClick={() => setFilterStatus('approuves')}
          >
            <span className="dot green"></span>
            Actifs ({vendeursApprouves})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'attente' ? 'active' : ''}`}
            onClick={() => setFilterStatus('attente')}
          >
            <span className="dot orange"></span>
            En attente ({vendeursEnAttente})
          </button>
        </div>
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
          </svg>
          <input
            type="text"
            placeholder="Rechercher un vendeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Vendeurs Grid */}
      <div className="vendeurs-grid">
        {filteredVendeurs.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"></path>
            </svg>
            <h3>Aucun vendeur trouvé</h3>
            <p>Modifiez vos filtres ou attendez de nouvelles inscriptions</p>
          </div>
        ) : (
          filteredVendeurs.map(vendeur => (
            <div key={vendeur.id} className={`vendeur-card ${!vendeur.estApprouve ? 'pending' : ''}`}>
              <div className="vendeur-header">
                <div className="vendeur-avatar">
                  {vendeur.nom?.charAt(0)?.toUpperCase() || 'V'}
                </div>
                <div className="vendeur-info">
                  <h3>{vendeur.nom}</h3>
                  <p className="vendeur-email">{vendeur.email}</p>
                  {vendeur.telephone && <p className="vendeur-phone">{vendeur.telephone}</p>}
                </div>
                <div className="vendeur-status">
                  <span className={`status-badge ${vendeur.estApprouve ? 'approved' : 'pending'}`}>
                    {vendeur.estApprouve ? 'Actif' : 'En attente'}
                  </span>
                </div>
              </div>
              <div className="vendeur-actions">
                {!vendeur.estApprouve ? (
                  <>
                    <button className="btn-action btn-approve" onClick={() => handleApprouverVendeur(vendeur.id)}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                      </svg>
                      Approuver
                    </button>
                    <button className="btn-action btn-reject" onClick={() => handleSupprimerVendeur(vendeur.id)}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                      </svg>
                      Rejeter
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-action btn-view" onClick={() => handleVoirDetails(vendeur)}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                      </svg>
                      Détails
                    </button>
                    <button className="btn-action btn-ban" onClick={() => handleBannirVendeur(vendeur.id)}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"></path>
                      </svg>
                      Bannir
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Détails Vendeur Modal */}
      {showDetailModal && selectedVendeur && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Détails du Vendeur</h3>
              <button className="close-modal" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-content">
              <div className="vendeur-profile">
                <div className="profile-avatar">
                  {selectedVendeur.nom?.charAt(0)?.toUpperCase() || 'V'}
                </div>
                <div className="profile-name">{selectedVendeur.nom}</div>
                <span className={`status-badge ${selectedVendeur.estApprouve ? 'approved' : 'pending'}`}>
                  {selectedVendeur.estApprouve ? 'Actif' : 'En attente'}
                </span>
              </div>
              <div className="vendeur-detail">
                <div className="detail-item">
                  <span className="detail-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </span>
                  <div className="detail-content">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedVendeur.email}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                  </span>
                  <div className="detail-content">
                    <span className="detail-label">Téléphone</span>
                    <span className="detail-value">{selectedVendeur.telephone || 'Non renseigné'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-action btn-close-modal" onClick={handleCloseModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendeurs;
