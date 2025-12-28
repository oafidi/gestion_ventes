import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Commandes.css';

const CommandesList = () => {
  const [commandes, setCommandes] = useState([]);
  const [vendeurs, setVendeurs] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Filtres
  const [filtreVendeur, setFiltreVendeur] = useState('');
  const [filtreProduit, setFiltreProduit] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  
  // Modal de modification de statut
  const [showModal, setShowModal] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [newStatut, setNewStatut] = useState('');
  const [updating, setUpdating] = useState(false);

  const statuts = [
    { value: 'EN_ATTENTE', label: 'En attente', color: '#ffc107' },
    { value: 'CONFIRMEE', label: 'Confirmée', color: '#17a2b8' },
    { value: 'EN_COURS_LIVRAISON', label: 'En livraison', color: '#007bff' },
    { value: 'LIVREE', label: 'Livrée', color: '#28a745' },
    { value: 'ANNULEE', label: 'Annulée', color: '#dc3545' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchCommandes();
  }, [filtreVendeur, filtreProduit, filtreStatut]);

  const fetchData = async () => {
    try {
      const [vendeursRes, produitsRes] = await Promise.all([
        api.get('/admin/vendeurs'),
        api.get('/admin/produits')
      ]);
      setVendeurs(vendeursRes.data);
      setProduits(produitsRes.data);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
    }
  };

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      let url = '/admin/commandes';
      const params = new URLSearchParams();
      
      if (filtreVendeur) params.append('vendeurId', filtreVendeur);
      if (filtreProduit) params.append('produitId', filtreProduit);
      if (filtreStatut) params.append('statut', filtreStatut);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await api.get(url);
      setCommandes(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des commandes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (commande) => {
    setSelectedCommande(commande);
    setNewStatut(commande.statut);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCommande(null);
    setNewStatut('');
  };

  const handleUpdateStatut = async () => {
    if (!selectedCommande || !newStatut) return;
    
    setUpdating(true);
    try {
      await api.put(`/admin/commandes/${selectedCommande.id}/statut`, { statut: newStatut });
      setMessage({ type: 'success', text: 'Statut mis à jour avec succès' });
      fetchCommandes();
      closeModal();
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Erreur lors de la mise à jour du statut' 
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatutBadge = (statut) => {
    const statutInfo = statuts.find(s => s.value === statut) || { label: statut, color: '#6c757d' };
    return (
      <span 
        className="statut-badge"
        style={{ backgroundColor: statutInfo.color }}
      >
        {statutInfo.label}
      </span>
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

  const resetFiltres = () => {
    setFiltreVendeur('');
    setFiltreProduit('');
    setFiltreStatut('');
  };

  if (loading && commandes.length === 0) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="commandes-container">
      <div className="commandes-header">
        <h1>Gestion des Commandes</h1>
        <p className="subtitle">Gérez les commandes et mettez à jour leur statut</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button onClick={() => setMessage({ type: '', text: '' })} className="close-btn">×</button>
        </div>
      )}

      {/* Filtres */}
      <div className="filtres-section">
        <h3>Filtres</h3>
        <div className="filtres-grid">
          <div className="filtre-group">
            <label>Vendeur</label>
            <select 
              value={filtreVendeur} 
              onChange={(e) => setFiltreVendeur(e.target.value)}
            >
              <option value="">Tous les vendeurs</option>
              {vendeurs.map(v => (
                <option key={v.id} value={v.id}>{v.nom}</option>
              ))}
            </select>
          </div>
          
          <div className="filtre-group">
            <label>Produit</label>
            <select 
              value={filtreProduit} 
              onChange={(e) => setFiltreProduit(e.target.value)}
            >
              <option value="">Tous les produits</option>
              {produits.map(p => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          </div>
          
          <div className="filtre-group">
            <label>Statut</label>
            <select 
              value={filtreStatut} 
              onChange={(e) => setFiltreStatut(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {statuts.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          
          <div className="filtre-group">
            <label>&nbsp;</label>
            <button onClick={resetFiltres} className="btn-reset">
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Liste des commandes */}
      <div className="commandes-list">
        <div className="commandes-count">
          {commandes.length} commande(s) trouvée(s)
        </div>
        
        {commandes.length === 0 ? (
          <div className="no-commandes">
            <p>Aucune commande trouvée</p>
          </div>
        ) : (
          <table className="commandes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Client</th>
                <th>Produits</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {commandes.map(commande => (
                <tr key={commande.id}>
                  <td className="commande-id">#{commande.id}</td>
                  <td>{formatDate(commande.dateCommande)}</td>
                  <td>
                    <div className="client-info">
                      <strong>{commande.clientNom}</strong>
                      <small>{commande.adresseLivraison}</small>
                    </div>
                  </td>
                  <td>
                    <div className="produits-list">
                      {commande.lignesCommande?.map((ligne, idx) => (
                        <div key={idx} className="produit-item">
                          <span>{ligne.vendeurProduit?.titre || 'Produit'}</span>
                          <span className="quantite">×{ligne.quantite}</span>
                          <small className="vendeur">
                            Par {ligne.vendeurProduit?.vendeurNom}
                          </small>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="montant">{parseFloat(commande.montantTotal).toFixed(2)} DH</td>
                  <td>{getStatutBadge(commande.statut)}</td>
                  <td>
                    <button 
                      className="btn-modifier"
                      onClick={() => openModal(commande)}
                    >
                      Modifier statut
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de modification de statut */}
      {showModal && selectedCommande && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <h2>Modifier le statut</h2>
            <p className="modal-subtitle">
              Commande #{selectedCommande.id} - {selectedCommande.clientNom}
            </p>
            
            <div className="modal-info">
              <p><strong>Montant:</strong> {parseFloat(selectedCommande.montantTotal).toFixed(2)} DH</p>
              <p><strong>Date:</strong> {formatDate(selectedCommande.dateCommande)}</p>
              <p><strong>Statut actuel:</strong> {getStatutBadge(selectedCommande.statut)}</p>
            </div>
            
            <div className="modal-form">
              <label>Nouveau statut</label>
              <select 
                value={newStatut} 
                onChange={(e) => setNewStatut(e.target.value)}
                className="statut-select"
              >
                {statuts.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            
            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeModal}>
                Annuler
              </button>
              <button 
                className="btn-confirm" 
                onClick={handleUpdateStatut}
                disabled={updating || newStatut === selectedCommande.statut}
              >
                {updating ? 'Mise à jour...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandesList;
