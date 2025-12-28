import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import './VendeurAuth.css';

const VendeurLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login(email, password);

      if (response.success) {
        // Vérifier que c'est bien un vendeur
        if (response.role !== 'VENDEUR') {
          setError('Ce compte n\'est pas un compte vendeur');
          setLoading(false);
          return;
        }

        // Sauvegarder le token et les infos utilisateur
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.id,
          nom: response.nom,
          email: response.email,
          role: response.role
        }));

        navigate('/vendeur/dashboard');
      } else {
        setError(response.message || 'Erreur de connexion');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur de connexion';
      if (errorMsg.includes('approuvé') || errorMsg.includes('attente')) {
        setError('Votre compte est en attente d\'approbation par l\'administrateur');
      } else {
        setError(errorMsg);
      }
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
          <h1>Espace Vendeur</h1>
          <p>Connectez-vous à votre compte vendeur</p>
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

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <svg viewBox="0 0 24 24" fill="currentColor" className="input-icon">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
              </svg>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendeur@example.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="input-wrapper">
              <svg viewBox="0 0 24 24" fill="currentColor" className="input-icon">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"></path>
              </svg>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="vendeur-auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Connexion en cours...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="vendeur-auth-footer">
          <p>Pas encore inscrit ? <Link to="/vendeur/signup">Créer un compte</Link></p>
          <p className="admin-link"><Link to="/login">Espace Administrateur</Link></p>
        </div>
      </div>
    </div>
  );
};

export default VendeurLogin;
