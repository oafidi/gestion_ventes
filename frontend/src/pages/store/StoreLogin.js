import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreHeader, StoreFooter, CartSidebar } from './StoreHome';
import { useCart } from '../../context/CartContext';
import storeService from '../../services/storeService';
import { FiLock, FiUserPlus } from 'react-icons/fi';
import '../../styles/Store.css';

const StoreLogin = () => {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState('login');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    telephone: '',
    adresseLivraison: ''
  });

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/store');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await storeService.login(formData.email, formData.password);
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.id,
          nom: response.nom,
          email: response.email,
          telephone: response.telephone,
          role: response.role
        }));
        navigate('/store');
      } else {
        setError(response.message || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await storeService.signupClient({
        nom: formData.nom,
        email: formData.email,
        motDePasse: formData.password,
        telephone: formData.telephone,
        adresseLivraison: formData.adresseLivraison
      });
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.id,
          nom: response.nom,
          email: response.email,
          telephone: response.telephone,
          role: response.role
        }));
        navigate('/store');
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
    <div className="store-container">
      <StoreHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        cartCount={getCartCount()}
        onCartClick={() => setCartOpen(true)}
      />

      <div className="store-wrapper" style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '450px', margin: '0 auto' }}>
          <div className="store-checkout-section">
            <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '24px', borderBottom: 'none', paddingBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              {authMode === 'login' ? <><FiLock /> Connexion</> : <><FiUserPlus /> Créer un compte</>}
            </h2>

            {error && (
              <div className="store-alert store-alert-error">{error}</div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLogin}>
                <div className="store-form-group">
                  <label className="store-form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="store-form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="store-form-group">
                  <label className="store-form-label">Mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    className="store-form-input"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                  />
                </div>
                <button 
                  type="submit" 
                  className="store-form-btn"
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
                <div className="store-form-switch">
                  Pas encore de compte?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('signup'); setError(''); }}>
                    S'inscrire
                  </a>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <div className="store-form-group">
                  <label className="store-form-label">Nom complet</label>
                  <input
                    type="text"
                    name="nom"
                    className="store-form-input"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                    placeholder="Votre nom"
                  />
                </div>
                <div className="store-form-group">
                  <label className="store-form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="store-form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="store-form-group">
                  <label className="store-form-label">Mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    className="store-form-input"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                  />
                </div>
                <div className="store-form-group">
                  <label className="store-form-label">Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    className="store-form-input"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    placeholder="+212 6XX-XXXXXX"
                  />
                </div>
                <div className="store-form-group">
                  <label className="store-form-label">Adresse de livraison</label>
                  <textarea
                    name="adresseLivraison"
                    className="store-form-input"
                    value={formData.adresseLivraison}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Votre adresse complète..."
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <button 
                  type="submit" 
                  className="store-form-btn"
                  disabled={loading}
                >
                  {loading ? 'Inscription...' : 'S\'inscrire'}
                </button>
                <div className="store-form-switch">
                  Déjà un compte?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('login'); setError(''); }}>
                    Se connecter
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <StoreFooter />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default StoreLogin;
