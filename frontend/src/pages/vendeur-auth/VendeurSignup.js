import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import './VendeurAuth.css';

const VendeurSignup = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    motDePasse: '',
    confirmPassword: '',
    telephone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (formData.motDePasse !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        nom: formData.nom,
        email: formData.email,
        motDePasse: formData.motDePasse,
        telephone: formData.telephone,
        role: 'VENDEUR'
      });

      if (response.success) {
        setSuccess('Inscription réussie ! Votre compte est en attente d\'approbation par l\'administrateur.');
        setTimeout(() => {
          navigate('/vendeur/login');
        }, 3000);
      } else {
        setError(response.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendeur-auth-container">
      <div className="vendeur-auth-box">
        <div className="vendeur-auth-header">
          <div className="logo vendeur-logo">
            <svg viewBox="0 0 24 24" fill="currentColor" className="logo-icon">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path>
            </svg>
          </div>
          <h1>Inscription Vendeur</h1>
          <p>Créez votre compte vendeur pour commencer à vendre</p>
        </div>

        <form onSubmit={handleSubmit} className="vendeur-auth-form">
          {error && (
            <div className="error-message">
              <svg viewBox="0 0 24 24" fill="currentColor" className="error-icon">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <svg viewBox="0 0 24 24" fill="currentColor" className="success-icon">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
              </svg>
              {success}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nom">Nom complet</label>
            <div className="input-wrapper">
              <svg viewBox="0 0 24 24" fill="currentColor" className="input-icon">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
              </svg>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Votre nom complet"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <svg viewBox="0 0 24 24" fill="currentColor" className="input-icon">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
              </svg>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vendeur@example.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="telephone">Téléphone</label>
            <div className="input-wrapper">
              <svg viewBox="0 0 24 24" fill="currentColor" className="input-icon">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"></path>
              </svg>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="+33 6 12 34 56 78"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="motDePasse">Mot de passe</label>
            <div className="input-wrapper">
              <svg viewBox="0 0 24 24" fill="currentColor" className="input-icon">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"></path>
              </svg>
              <input
                type="password"
                id="motDePasse"
                name="motDePasse"
                value={formData.motDePasse}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <div className="input-wrapper">
              <svg viewBox="0 0 24 24" fill="currentColor" className="input-icon">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"></path>
              </svg>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="vendeur-auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Inscription en cours...
              </>
            ) : (
              'S\'inscrire'
            )}
          </button>
        </form>

        <div className="vendeur-auth-footer">
          <p>Déjà inscrit ? <Link to="/vendeur/login">Se connecter</Link></p>
          <p className="admin-link"><Link to="/login">Espace Administrateur</Link></p>
        </div>
      </div>
    </div>
  );
};

export default VendeurSignup;
