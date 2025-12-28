import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { StoreHeader, StoreFooter, CartSidebar } from './StoreHome';
import storeService from '../../services/storeService';
import { 
  FiShoppingCart, 
  FiUser, 
  FiMapPin, 
  FiFileText, 
  FiCreditCard, 
  FiLock, 
  FiX,
  FiShoppingBag
} from 'react-icons/fi';
import '../../styles/Store.css';

const StoreCheckout = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart, getCartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [user, setUser] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    adresseLivraison: '',
    telephone: '',
    notes: ''
  });

  // Auth form states
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    nom: '',
    telephone: '',
    adresseLivraison: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        telephone: userData.telephone || '',
        adresseLivraison: userData.adresseLivraison || ''
      }));
    }

    if (cartItems.length === 0) {
      navigate('/store/shop');
    }
  }, [cartItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthInputChange = (e) => {
    const { name, value } = e.target;
    setAuthData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await storeService.login(authData.email, authData.password);
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.id,
          nom: response.nom,
          email: response.email,
          telephone: response.telephone,
          role: response.role,
          adresseLivraison: response.adresseLivraison
        }));
        setUser({
          id: response.id,
          nom: response.nom,
          email: response.email,
          telephone: response.telephone,
          role: response.role,
          adresseLivraison: response.adresseLivraison
        });
        setFormData(prev => ({
          ...prev,
          telephone: response.telephone || prev.telephone,
          adresseLivraison: response.adresseLivraison || prev.adresseLivraison
        }));
        setShowAuthModal(false);
      } else {
        setError(response.message || 'Erreur de connexion');
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
        nom: authData.nom,
        email: authData.email,
        motDePasse: authData.password,
        telephone: authData.telephone,
        adresseLivraison: authData.adresseLivraison
      });
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.id,
          nom: response.nom,
          email: response.email,
          telephone: response.telephone,
          role: response.role,
          adresseLivraison: authData.adresseLivraison
        }));
        setUser({
          id: response.id,
          nom: response.nom,
          email: response.email,
          telephone: response.telephone,
          role: response.role,
          adresseLivraison: authData.adresseLivraison
        });
        setFormData(prev => ({
          ...prev,
          telephone: authData.telephone,
          adresseLivraison: authData.adresseLivraison
        }));
        setShowAuthModal(false);
      } else {
        setError(response.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!formData.adresseLivraison) {
      setError('Veuillez renseigner votre adresse de livraison');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Debug: Vérifier l'authentification
      console.log('=== DEBUG AUTH ===');
      console.log('Token dans localStorage:', localStorage.getItem('token'));
      console.log('User dans localStorage:', localStorage.getItem('user'));
      
      try {
        const debugInfo = await storeService.debugAuth();
        console.log('Debug Auth Response:', debugInfo);
      } catch (debugErr) {
        console.error('Debug Auth Error:', debugErr.response?.status, debugErr.response?.data);
      }

      const commandeData = {
        adresseLivraison: formData.adresseLivraison,
        telephone: formData.telephone,
        notes: formData.notes,
        lignesCommande: cartItems.map(item => ({
          vendeurProduitId: item.id,
          quantite: item.quantity,
          prixUnitaire: item.prixVendeur
        }))
      };

      console.log('Sending order data:', commandeData);
      await storeService.passerCommande(commandeData);
      clearCart();
      navigate('/store/order-success');
    } catch (err) {
      console.error('Order error:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.status === 403) {
        setError('Accès refusé. Veuillez vous déconnecter et vous reconnecter en tant que client.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } else if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la commande. Veuillez réessayer.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8080${imagePath}`;
  };

  const subtotal = getCartTotal();
  const shipping = subtotal >= 500 ? 0 : 30;
  const total = subtotal + shipping;

  return (
    <div className="store-container">
      <StoreHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        cartCount={getCartCount()}
        onCartClick={() => setCartOpen(true)}
      />

      <div className="store-wrapper">
        {/* Breadcrumb */}
        <div className="store-breadcrumb" style={{ padding: '20px 0' }}>
          <Link to="/store">Accueil</Link>
          <span>/</span>
          <span style={{ color: 'var(--store-gray-700)' }}>Commande</span>
        </div>

        <div className="store-checkout">
          <h1 style={{ marginBottom: '30px', fontSize: '28px' }}><FiShoppingCart style={{ marginRight: '10px' }} /> Finaliser la commande</h1>

          {error && (
            <div className="store-alert store-alert-error">{error}</div>
          )}

          <div className="store-checkout-grid">
            {/* Checkout Form */}
            <div>
              {/* Authentication Status */}
              <div className="store-checkout-section">
                <h2><FiUser style={{ marginRight: '10px' }} /> Compte</h2>
                {user ? (
                  <div>
                    <p style={{ marginBottom: '10px' }}>
                      Connecté en tant que <strong>{user.nom}</strong> ({user.email})
                    </p>
                    <button 
                      className="store-btn-secondary"
                      style={{ padding: '10px 20px', fontSize: '14px' }}
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                      }}
                    >
                      Se déconnecter
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ marginBottom: '15px', color: 'var(--store-gray-500)' }}>
                      Connectez-vous pour passer votre commande
                    </p>
                    <button 
                      className="store-btn-primary"
                      style={{ padding: '12px 25px' }}
                      onClick={() => setShowAuthModal(true)}
                    >
                      Se connecter / S'inscrire
                    </button>
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              <div className="store-checkout-section">
                <h2><FiMapPin style={{ marginRight: '10px' }} /> Adresse de livraison</h2>
                <div className="store-form-group">
                  <label className="store-form-label">Adresse complète *</label>
                  <textarea
                    name="adresseLivraison"
                    className="store-form-input"
                    value={formData.adresseLivraison}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Numéro, rue, ville, code postal..."
                    required
                    style={{ resize: 'vertical' }}
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
              </div>

              {/* Notes */}
              <div className="store-checkout-section">
                <h2><FiFileText style={{ marginRight: '10px' }} /> Notes (optionnel)</h2>
                <div className="store-form-group" style={{ marginBottom: 0 }}>
                  <textarea
                    name="notes"
                    className="store-form-input"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Instructions spéciales pour la livraison..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="store-checkout-section">
                <h2><FiCreditCard style={{ marginRight: '10px' }} /> Paiement</h2>
                <div style={{ 
                  padding: '15px', 
                  background: 'var(--store-gray-100)', 
                  borderRadius: 'var(--store-radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <input type="radio" checked readOnly id="cod" />
                  <label htmlFor="cod" style={{ cursor: 'pointer' }}>
                    <strong>Paiement à la livraison</strong>
                    <p style={{ fontSize: '13px', color: 'var(--store-gray-500)', margin: '5px 0 0' }}>
                      Payez en espèces lors de la réception de votre commande
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="store-order-summary">
                <h2><FiShoppingBag style={{ marginRight: '10px' }} /> Récapitulatif</h2>
                <div className="store-order-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="store-order-item">
                      {item.image ? (
                        <img 
                          src={getImageUrl(item.image)} 
                          alt={item.titre}
                          className="store-order-item-image"
                        />
                      ) : (
                        <div className="store-order-item-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiShoppingBag size={20} /></div>
                      )}
                      <div className="store-order-item-info">
                        <div className="store-order-item-title">{item.titre}</div>
                        <div className="store-order-item-qty">Qté: {item.quantity}</div>
                      </div>
                      <div className="store-order-item-price">
                        {(item.prixVendeur * item.quantity).toFixed(2)} DH
                      </div>
                    </div>
                  ))}
                </div>
                <div className="store-order-totals">
                  <div className="store-order-total-row">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} DH</span>
                  </div>
                  <div className="store-order-total-row">
                    <span>Livraison</span>
                    <span>{shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)} DH`}</span>
                  </div>
                  <div className="store-order-total-row final">
                    <span>Total</span>
                    <span>{total.toFixed(2)} DH</span>
                  </div>
                </div>
                <button 
                  className="store-checkout-btn"
                  onClick={handleCheckout}
                  disabled={loading}
                  style={{ marginTop: '20px' }}
                >
                  {loading ? 'Traitement...' : <><FiLock style={{ marginRight: '8px' }} /> Confirmer la commande</>}
                </button>
                <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--store-gray-500)', marginTop: '15px' }}>
                  En passant commande, vous acceptez nos CGV
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StoreFooter />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="store-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="store-modal" onClick={(e) => e.stopPropagation()}>
            <div className="store-modal-header">
              <h2>{authMode === 'login' ? <><FiLock style={{ marginRight: '8px' }} /> Connexion</> : <><FiUser style={{ marginRight: '8px' }} /> Inscription</>}</h2>
              <button 
                className="store-modal-close"
                onClick={() => setShowAuthModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className="store-modal-body">
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
                      value={authData.email}
                      onChange={handleAuthInputChange}
                      required
                    />
                  </div>
                  <div className="store-form-group">
                    <label className="store-form-label">Mot de passe</label>
                    <input
                      type="password"
                      name="password"
                      className="store-form-input"
                      value={authData.password}
                      onChange={handleAuthInputChange}
                      required
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
                      value={authData.nom}
                      onChange={handleAuthInputChange}
                      required
                    />
                  </div>
                  <div className="store-form-group">
                    <label className="store-form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="store-form-input"
                      value={authData.email}
                      onChange={handleAuthInputChange}
                      required
                    />
                  </div>
                  <div className="store-form-group">
                    <label className="store-form-label">Mot de passe</label>
                    <input
                      type="password"
                      name="password"
                      className="store-form-input"
                      value={authData.password}
                      onChange={handleAuthInputChange}
                      required
                    />
                  </div>
                  <div className="store-form-group">
                    <label className="store-form-label">Téléphone</label>
                    <input
                      type="tel"
                      name="telephone"
                      className="store-form-input"
                      value={authData.telephone}
                      onChange={handleAuthInputChange}
                      placeholder="+212 6XX-XXXXXX"
                    />
                  </div>
                  <div className="store-form-group">
                    <label className="store-form-label">Adresse de livraison</label>
                    <textarea
                      name="adresseLivraison"
                      className="store-form-input"
                      value={authData.adresseLivraison}
                      onChange={handleAuthInputChange}
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
      )}
    </div>
  );
};

export default StoreCheckout;
