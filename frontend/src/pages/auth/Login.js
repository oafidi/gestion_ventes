import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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

    const result = await login(email, password);
    
    if (result.success) {
      // Vérifier que c'est bien un admin
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role !== 'ADMIN') {
        setError('Accès réservé aux administrateurs. Utilisez l\'espace vendeur.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="logo">
            <svg viewBox="0 0 24 24" fill="currentColor" className="logo-icon">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1>Gestion des Ventes</h1>
          <p>Connectez-vous à votre espace administrateur</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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
                placeholder="admin@affiliate.com"
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

          <button type="submit" className="login-button" disabled={loading}>
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

        <div className="login-footer">
          <p><Link to="/vendeur/login" style={{color: '#667eea'}}>Espace Vendeur →</Link></p>
          <p>© 2024 Gestion des Ventes. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
