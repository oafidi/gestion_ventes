import React, { useState, useEffect } from 'react';
import vendeurProduitService from '../../services/vendeurProduitService';
import ConfirmModal from '../../components/ConfirmModal';
import { BACKEND_URL } from '../../config/apiConfig';
import './Inscriptions.css';

const Inscriptions = () => {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInscription, setSelectedInscription] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // États pour la modale de confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: '', id: null, title: '', message: '' });

  // Charger les inscriptions
  const fetchInscriptions = async () => {
    try {
      setLoading(true);
      const inscriptionsData = await vendeurProduitService.getAllInscriptions();
      setInscriptions(inscriptionsData || []);
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des inscriptions');
      setInscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInscriptions();
  }, []);

  // Approuver une inscription
  const handleApprouverInscription = async (id) => {
    try {
      await vendeurProduitService.approuverInscription(id);
      setSuccess('Inscription approuvée avec succès');
      fetchInscriptions();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erreur lors de l\'approbation');
    }
  };

  // Bannir une inscription
  const handleBannirInscription = (id) => {
    setConfirmAction({
      type: 'bannir',
      id,
      title: 'Bannir l\'inscription',
      message: 'Êtes-vous sûr de vouloir bannir cette inscription ?'
    });
    setShowConfirmModal(true);
  };

  // Supprimer une inscription
  const handleSupprimerInscription = (id) => {
    setConfirmAction({
      type: 'supprimer',
      id,
      title: 'Supprimer l\'inscription',
      message: 'Êtes-vous sûr de vouloir supprimer cette inscription ?'
    });
    setShowConfirmModal(true);
  };

  // Confirmer l'action
  const confirmInscriptionAction = async () => {
    try {
      if (confirmAction.type === 'bannir') {
        await vendeurProduitService.bannirInscription(confirmAction.id);
        setSuccess('Inscription bannie');
      } else if (confirmAction.type === 'supprimer') {
        await vendeurProduitService.rejeterInscription(confirmAction.id);
        setSuccess('Inscription supprimée');
      }
      fetchInscriptions();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Erreur lors de l'opération`);
    }
    setShowConfirmModal(false);
    setConfirmAction({ type: '', id: null, title: '', message: '' });
  };

  // Voir les détails d'une inscription
  const handleVoirDetails = (inscription) => {
    setSelectedInscription(inscription);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setSelectedInscription(null);
    setShowDetailModal(false);
  };

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

  // Filtrer les inscriptions
  const filteredInscriptions = inscriptions.filter(i => {
    const matchesSearch = i.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         i.vendeurNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         i.produitNom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'tous' || 
                         (filterStatus === 'approuves' && i.estApprouve) ||
                         (filterStatus === 'attente' && !i.estApprouve);
    return matchesSearch && matchesFilter;
  });

  // Compteurs
  const inscriptionsApprouvees = inscriptions.filter(i => i.estApprouve).length;
  const inscriptionsEnAttente = inscriptions.filter(i => !i.estApprouve).length;

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
          <h2>Inscriptions Produits</h2>
          <p className="page-subtitle">Gérez les inscriptions des vendeurs aux produits</p>
        </div>
        <div className="header-stats">
          <span className="stat-badge approved">{inscriptionsApprouvees} actives</span>
          <span className="stat-badge pending">{inscriptionsEnAttente} en attente</span>
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

      {/* Filter Bar */}
      <div className="inscriptions-toolbar">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filterStatus === 'tous' ? 'active' : ''}`}
            onClick={() => setFilterStatus('tous')}
          >
            Tous ({inscriptions.length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'approuves' ? 'active' : ''}`}
            onClick={() => setFilterStatus('approuves')}
          >
            <span className="dot green"></span>
            Actifs ({inscriptionsApprouvees})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'attente' ? 'active' : ''}`}
            onClick={() => setFilterStatus('attente')}
          >
            <span className="dot orange"></span>
            En attente ({inscriptionsEnAttente})
          </button>
        </div>
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
          </svg>
          <input
            type="text"
            placeholder="Rechercher une inscription..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Inscriptions Grid */}
      <div className="inscriptions-grid">
        {filteredInscriptions.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path>
            </svg>
            <h3>Aucune inscription trouvée</h3>
            <p>Modifiez vos filtres ou attendez de nouvelles inscriptions</p>
          </div>
        ) : (
          filteredInscriptions.map(inscription => (
            <div key={inscription.id} className={`inscription-card ${!inscription.estApprouve ? 'pending' : ''}`}>
              <div className="inscription-image">
                {inscription.image ? (
                  <img src={getImageUrl(inscription.image)} alt={inscription.titre} />
                ) : (
                  <div className="inscription-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path>
                    </svg>
                  </div>
                )}
                <div className={`status-overlay ${inscription.estApprouve ? 'approved' : 'pending'}`}>
                  {inscription.estApprouve ? 'Active' : 'En attente'}
                </div>
              </div>
              <div className="inscription-content">
                <h3>{inscription.titre}</h3>
                <div className="inscription-meta">
                  <span className="meta-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                    </svg>
                    {inscription.vendeurNom}
                  </span>
                  <span className="meta-item">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path>
                    </svg>
                    {inscription.produitNom}
                  </span>
                </div>
                {inscription.categorieNom && (
                  <span className="categorie-badge">{inscription.categorieNom}</span>
                )}
                <div className="prix-comparison">
                  <div className="prix-item">
                    <span className="prix-label">Prix original:</span>
                    <span className="prix-value original">{formatPrice(inscription.prixOriginal)}</span>
                  </div>
                  <div className="prix-item">
                    <span className="prix-label">Prix vendeur:</span>
                    <span className="prix-value vendeur">{formatPrice(inscription.prixVendeur)}</span>
                  </div>
                  <div className="prix-item marge">
                    <span className="prix-label">Marge:</span>
                    <span className="prix-value">{formatPrice(inscription.prixVendeur - inscription.prixOriginal)}</span>
                  </div>
                </div>
              </div>
              <div className="inscription-actions">
                {!inscription.estApprouve ? (
                  <>
                    <button className="btn-action btn-approve" onClick={() => handleApprouverInscription(inscription.id)}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                      </svg>
                      Approuver
                    </button>
                    <button className="btn-action btn-reject" onClick={() => handleSupprimerInscription(inscription.id)}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                      </svg>
                      Rejeter
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-action btn-view" onClick={() => handleVoirDetails(inscription)}>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"></path>
                      </svg>
                      Voir
                    </button>
                    <button className="btn-action btn-ban" onClick={() => handleBannirInscription(inscription.id)}>
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

      {/* Modal Détails Inscription */}
      {showDetailModal && selectedInscription && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Détails de l'Inscription</h3>
              <button className="close-modal" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              {selectedInscription.image && (
                <div className="modal-image">
                  <img src={getImageUrl(selectedInscription.image)} alt={selectedInscription.titre} />
                </div>
              )}
              <div className="inscription-detail">
                <div className="detail-item">
                  <span className="detail-label">Titre</span>
                  <span className="detail-value">{selectedInscription.titre}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Vendeur</span>
                  <span className="detail-value">{selectedInscription.vendeurNom}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Produit</span>
                  <span className="detail-value">{selectedInscription.produitNom}</span>
                </div>
                {selectedInscription.categorieNom && (
                  <div className="detail-item">
                    <span className="detail-label">Catégorie</span>
                    <span className="detail-value">{selectedInscription.categorieNom}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Prix original</span>
                  <span className="detail-value original">{formatPrice(selectedInscription.prixOriginal)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Prix vendeur</span>
                  <span className="detail-value vendeur">{formatPrice(selectedInscription.prixVendeur)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Marge</span>
                  <span className="detail-value marge">{formatPrice(selectedInscription.prixVendeur - selectedInscription.prixOriginal)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Statut</span>
                  <span className="detail-value">
                    <span className={`status-badge ${selectedInscription.estApprouve ? 'approved' : 'pending'}`}>
                      {selectedInscription.estApprouve ? 'Active' : 'En attente'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-action btn-close-modal" onClick={handleCloseModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmInscriptionAction}
        title={confirmAction.title}
        message={confirmAction.message}
        confirmText={confirmAction.type === 'bannir' ? 'Bannir' : 'Supprimer'}
        type="danger"
      />
    </div>
  );
};

export default Inscriptions;
