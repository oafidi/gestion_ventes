import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreHeader, StoreFooter, CartSidebar } from './StoreHome';
import { useCart } from '../../context/CartContext';
import storeService from '../../services/storeService';
import { FiUser, FiPackage, FiSettings, FiLogOut, FiShoppingBag, FiInbox, FiXCircle, FiAlertTriangle, FiX } from 'react-icons/fi';
import '../../styles/Store.css';

const StoreAccount = () => {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/store/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const data = await storeService.getMesCommandes();
      // Filtrer les commandes annulées
      const activeOrders = data.filter(order => order.statut !== 'ANNULEE');
      setOrders(activeOrders);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/store');
  };

  const openCancelModal = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setOrderToCancel(null);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    setCancellingOrderId(orderToCancel.id);
    setMessage({ type: '', text: '' });
    closeCancelModal();

    try {
      const response = await storeService.annulerCommande(orderToCancel.id);
      if (response.success) {
        setMessage({ type: 'success', text: response.message });
        // Rafraîchir les commandes
        fetchOrders();
      } else {
        setMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de l\'annulation de la commande' 
      });
    } finally {
      setCancellingOrderId(null);
    }
  };

  const canCancelOrder = (status) => {
    return status === 'EN_ATTENTE';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'EN_ATTENTE': { label: 'En attente', color: '#ffc107' },
      'CONFIRMEE': { label: 'Confirmée', color: '#17a2b8' },
      'EN_COURS_LIVRAISON': { label: 'En livraison', color: '#007bff' },
      'LIVREE': { label: 'Livrée', color: '#28a745' },
      'ANNULEE': { label: 'Annulée', color: '#dc3545' }
    };
    const statusInfo = statusMap[status] || { label: status, color: '#6c757d' };
    return (
      <span style={{
        background: statusInfo.color,
        color: 'white',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {statusInfo.label}
      </span>
    );
  };

  if (!user) return null;

  return (
    <div className="store-container">
      <StoreHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        cartCount={getCartCount()}
        onCartClick={() => setCartOpen(true)}
      />

      <div className="store-wrapper" style={{ padding: '40px 20px' }}>
        {/* Breadcrumb */}
        <div className="store-breadcrumb">
          <Link to="/store">Accueil</Link>
          <span>/</span>
          <span style={{ color: 'var(--store-gray-700)' }}>Mon compte</span>
        </div>

        <h1 style={{ marginBottom: '30px', fontSize: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}><FiUser /> Mon compte</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
          {/* Sidebar */}
          <div className="store-checkout-section" style={{ height: 'fit-content' }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'var(--store-primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px',
                color: 'white'
              }}>
                {user.nom?.charAt(0)?.toUpperCase() || <FiUser size={32} />}
              </div>
              <h3 style={{ margin: '0 0 5px' }}>{user.nom}</h3>
              <p style={{ color: 'var(--store-gray-500)', fontSize: '14px', margin: 0 }}>{user.email}</p>
            </div>

            <nav>
              <button
                onClick={() => setActiveTab('orders')}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: 'none',
                  background: activeTab === 'orders' ? 'var(--store-primary)' : 'transparent',
                  color: activeTab === 'orders' ? 'white' : 'var(--store-gray-700)',
                  textAlign: 'left',
                  borderRadius: 'var(--store-radius-sm)',
                  cursor: 'pointer',
                  marginBottom: '8px',
                  fontWeight: activeTab === 'orders' ? '600' : '400',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <FiPackage /> Mes commandes
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: 'none',
                  background: activeTab === 'profile' ? 'var(--store-primary)' : 'transparent',
                  color: activeTab === 'profile' ? 'white' : 'var(--store-gray-700)',
                  textAlign: 'left',
                  borderRadius: 'var(--store-radius-sm)',
                  cursor: 'pointer',
                  marginBottom: '8px',
                  fontWeight: activeTab === 'profile' ? '600' : '400',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <FiSettings /> Mon profil
              </button>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--store-danger)',
                  textAlign: 'left',
                  borderRadius: 'var(--store-radius-sm)',
                  cursor: 'pointer',
                  fontWeight: '400',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <FiLogOut /> Déconnexion
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div>
            {activeTab === 'orders' && (
              <div className="store-checkout-section">
                <h2 style={{ borderBottom: '1px solid var(--store-gray-200)', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiPackage /> Mes commandes
                </h2>

                {message.text && (
                  <div style={{
                    padding: '12px 15px',
                    marginBottom: '20px',
                    borderRadius: 'var(--store-radius-sm)',
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24',
                    border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                  }}>
                    {message.text}
                  </div>
                )}

                {loading ? (
                  <div className="store-loading">
                    <div className="store-spinner"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--store-gray-500)' }}>
                    <div style={{ marginBottom: '15px' }}><FiInbox size={50} /></div>
                    <p>Vous n'avez pas encore de commandes</p>
                    <Link to="/store/shop" className="store-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '20px', textDecoration: 'none', padding: '12px 25px' }}>
                      <FiShoppingBag /> Commencer vos achats
                    </Link>
                  </div>
                ) : (
                  <div>
                    {orders.map(order => (
                      <div key={order.id} style={{
                        border: '1px solid var(--store-gray-200)',
                        borderRadius: 'var(--store-radius-sm)',
                        padding: '20px',
                        marginBottom: '15px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                          <div>
                            <strong>Commande #{order.id}</strong>
                            <p style={{ color: 'var(--store-gray-500)', fontSize: '13px', margin: '5px 0 0' }}>
                              {new Date(order.dateCommande).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {getStatusBadge(order.statut)}
                        </div>

                        {order.lignesCommande && order.lignesCommande.length > 0 && (
                          <div style={{ marginBottom: '15px' }}>
                            {order.lignesCommande.map((ligne, idx) => (
                              <div key={idx} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '8px 0',
                                borderBottom: idx < order.lignesCommande.length - 1 ? '1px solid var(--store-gray-100)' : 'none',
                                fontSize: '14px'
                              }}>
                                <span>
                                  {ligne.vendeurProduit?.titre || 'Produit'} × {ligne.quantite}
                                </span>
                                <span style={{ fontWeight: '600' }}>
                                  {parseFloat(ligne.sousTotal).toFixed(2)} DH
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '15px',
                          borderTop: '1px solid var(--store-gray-200)'
                        }}>
                          <span style={{ fontWeight: '600' }}>Total</span>
                          <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--store-primary)' }}>
                            {parseFloat(order.montantTotal).toFixed(2)} DH
                          </span>
                        </div>

                        {/* Bouton d'annulation */}
                        {canCancelOrder(order.statut) && (
                          <div style={{ marginTop: '15px', textAlign: 'right' }}>
                            <button
                              onClick={() => openCancelModal(order)}
                              disabled={cancellingOrderId === order.id}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: 'transparent',
                                color: '#dc3545',
                                border: '1px solid #dc3545',
                                borderRadius: 'var(--store-radius-sm)',
                                cursor: cancellingOrderId === order.id ? 'not-allowed' : 'pointer',
                                opacity: cancellingOrderId === order.id ? 0.6 : 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                if (cancellingOrderId !== order.id) {
                                  e.target.style.backgroundColor = '#dc3545';
                                  e.target.style.color = 'white';
                                }
                              }}
                              onMouseOut={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#dc3545';
                              }}
                            >
                              <FiXCircle />
                              {cancellingOrderId === order.id ? 'Annulation...' : 'Annuler la commande'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="store-checkout-section">
                <h2 style={{ borderBottom: '1px solid var(--store-gray-200)', paddingBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiSettings /> Mon profil
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="store-form-group">
                    <label className="store-form-label">Nom</label>
                    <input
                      type="text"
                      className="store-form-input"
                      value={user.nom || ''}
                      disabled
                    />
                  </div>
                  <div className="store-form-group">
                    <label className="store-form-label">Email</label>
                    <input
                      type="email"
                      className="store-form-input"
                      value={user.email || ''}
                      disabled
                    />
                  </div>
                  <div className="store-form-group">
                    <label className="store-form-label">Téléphone</label>
                    <input
                      type="tel"
                      className="store-form-input"
                      value={user.telephone || '-'}
                      disabled
                    />
                  </div>
                  <div className="store-form-group">
                    <label className="store-form-label">Rôle</label>
                    <input
                      type="text"
                      className="store-form-input"
                      value={user.role || '-'}
                      disabled
                    />
                  </div>
                </div>

                <p style={{ color: 'var(--store-gray-500)', fontSize: '14px', marginTop: '20px' }}>
                  Pour modifier vos informations, veuillez contacter le support.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <StoreFooter />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Modal de confirmation d'annulation */}
      {showCancelModal && orderToCancel && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={closeCancelModal}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '30px',
                maxWidth: '450px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bouton fermer */}
              <button
                onClick={closeCancelModal}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  color: '#6c757d'
                }}
              >
                <FiX size={20} />
              </button>

              {/* Icône d'avertissement */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <FiAlertTriangle size={30} color="#856404" />
                </div>
              </div>

              {/* Titre */}
              <h3 style={{ 
                textAlign: 'center', 
                marginBottom: '15px',
                fontSize: '20px',
                color: '#333'
              }}>
                Confirmer l'annulation
              </h3>

              {/* Message */}
              <p style={{ 
                textAlign: 'center', 
                color: '#666',
                marginBottom: '10px',
                lineHeight: '1.5'
              }}>
                Êtes-vous sûr de vouloir annuler la commande <strong>#{orderToCancel.id}</strong> ?
              </p>
              <p style={{ 
                textAlign: 'center', 
                color: '#666',
                marginBottom: '25px',
                fontSize: '14px'
              }}>
                Montant: <strong>{parseFloat(orderToCancel.montantTotal).toFixed(2)} DH</strong>
              </p>

              {/* Boutons */}
              <div style={{ 
                display: 'flex', 
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={closeCancelModal}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f8f9fa',
                    color: '#333',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  Non, garder
                </button>
                <button
                  onClick={handleCancelOrder}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <FiXCircle /> Oui, annuler
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StoreAccount;
