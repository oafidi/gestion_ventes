import React, { useState, useEffect } from 'react';
import vendeurService from '../../services/vendeurService';
import './VendeurDashboard.css';

const VendeurProfil = () => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({ nom: '', telephone: '', adresse: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setProfileData({
        nom: userData.nom || '',
        telephone: userData.telephone || '',
        adresse: userData.adresse || ''
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await vendeurService.updateMonProfil(profileData);
      
      // Mettre à jour le localStorage
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la mise à jour du profil' });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setProfileData({
      nom: user?.nom || '',
      telephone: user?.telephone || '',
      adresse: user?.adresse || ''
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  if (!user) {
    return (
      <div className="vendeur-content">
        <div className="loading-spinner">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="vendeur-content">
      <div className="page-header">
        <h2>Mon profil</h2>
        {!isEditing && (
          <button className="btn-primary" onClick={() => setIsEditing(true)}>
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18, marginRight: 8 }}>
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Modifier
          </button>
        )}
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <div className="profile-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                name="nom"
                value={profileData.nom}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={!isEditing ? 'disabled' : ''}
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="disabled"
              />
              <small>L'email ne peut pas être modifié</small>
            </div>
            
            <div className="form-group">
              <label>Téléphone *</label>
              <input
                type="tel"
                name="telephone"
                value={profileData.telephone}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className={!isEditing ? 'disabled' : ''}
              />
            </div>
            
            <div className="form-group">
              <label>Statut</label>
              <input
                type="text"
                value="Vendeur"
                disabled
                className="disabled"
              />
            </div>
            
            <div className="form-group full-width">
              <label>Adresse</label>
              <textarea
                name="adresse"
                value={profileData.adresse}
                onChange={handleChange}
                disabled={!isEditing}
                rows={3}
                className={!isEditing ? 'disabled' : ''}
              />
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={cancelEdit}>
                Annuler
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18, marginRight: 8 }}>
                  <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                </svg>
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default VendeurProfil;
