import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import VendeurMesProduits from './VendeurMesProduits';
import VendeurInscrireProduit from './VendeurInscrireProduit';
import VendeurModifierProduit from './VendeurModifierProduit';
import VendeurAvis from './VendeurAvis';
import { VendeurAnalyticsDashboard } from '../analytics';
import { getKPIsVendeur, getCommandesVendeur, formatCurrency } from '../../services/analyticsService';
import './VendeurDashboard.css';

const VendeurHome = () => {
  const [kpis, setKpis] = useState(null);
  const [commandes, setCommandes] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [kpisData, commandesData] = await Promise.all([
          getKPIsVendeur({}),
          getCommandesVendeur({})
        ]);
        setKpis(kpisData);
        setCommandes(commandesData);
      } catch (err) {
        console.error('Erreur chargement données:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="vendeur-content">
        <div className="loading-spinner">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="vendeur-content">
      <h2>Bienvenue dans votre espace vendeur</h2>
      
      {/* KPIs rapides */}
      <div className="vendeur-kpi-grid">
        <div className="vendeur-kpi-card success">
          <div className="kpi-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Chiffre d'affaires (livrées)</span>
            <span className="kpi-value">{formatCurrency(kpis?.chiffreAffairesTotal || 0)}</span>
          </div>
        </div>
        
        <div className="vendeur-kpi-card primary">
          <div className="kpi-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Commandes</span>
            <span className="kpi-value">{commandes?.totalCommandes || 0}</span>
          </div>
        </div>
        
        <div className="vendeur-kpi-card warning">
          <div className="kpi-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l-5.5 9h11z M12 22l5.5-9h-11z"/>
            </svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">En attente</span>
            <span className="kpi-value">{commandes?.enAttente || 0}</span>
          </div>
        </div>
        
        <div className="vendeur-kpi-card info">
          <div className="kpi-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Livrées</span>
            <span className="kpi-value">{commandes?.livrees || 0}</span>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <h3 style={{marginTop: '2rem', marginBottom: '1rem'}}>Actions rapides</h3>
      <div className="vendeur-stats-grid">
        <div className="vendeur-stat-card">
          <div className="stat-icon products">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Mes Produits</h3>
            <p>Gérez vos produits commercialisés</p>
          </div>
          <Link to="/vendeur/dashboard/mes-produits" className="stat-link">Voir →</Link>
        </div>
        <div className="vendeur-stat-card">
          <div className="stat-icon add">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Nouveau Produit</h3>
            <p>Inscrivez-vous à un produit</p>
          </div>
          <Link to="/vendeur/dashboard/inscrire-produit" className="stat-link">Ajouter →</Link>
        </div>
        <div className="vendeur-stat-card">
          <div className="stat-icon analytics">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"></path>
            </svg>
          </div>
          <div className="stat-info">
            <h3>Analytics</h3>
            <p>Analysez vos performances</p>
          </div>
          <Link to="/vendeur/dashboard/analytics" className="stat-link">Voir →</Link>
        </div>
      </div>

      {/* Dernières commandes */}
      {commandes?.commandes?.length > 0 && (
        <>
          <h3 style={{marginTop: '2rem', marginBottom: '1rem'}}>Dernières commandes</h3>
          <div className="recent-orders">
            {commandes.commandes.slice(0, 5).map((cmd) => (
              <div key={cmd.id} className="order-item">
                <div className="order-info">
                  <span className="order-id">#{cmd.id}</span>
                  <span className="order-client">{cmd.clientNom}</span>
                </div>
                <div className="order-amount">
                  <span className={`order-status status-${cmd.statut.toLowerCase()}`}>
                    {cmd.statut === 'EN_ATTENTE' ? 'En attente' : 
                     cmd.statut === 'CONFIRMEE' ? 'Confirmée' :
                     cmd.statut === 'LIVREE' ? 'Livrée' : 'Annulée'}
                  </span>
                  <span className="order-marge">+{formatCurrency(cmd.margeVendeur)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const VendeurDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/vendeur/login');
  };

  const menuItems = [
    { path: '/vendeur/dashboard', label: 'Accueil', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
    { path: '/vendeur/dashboard/analytics', label: 'Analytics', icon: 'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z' },
    { path: '/vendeur/dashboard/mes-produits', label: 'Mes Produits', icon: 'M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z' },
    { path: '/vendeur/dashboard/inscrire-produit', label: 'Inscrire Produit', icon: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' },
    { path: '/vendeur/dashboard/avis', label: 'Avis Clients', icon: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' },
  ];

  return (
    <div className="vendeur-dashboard-container">
      {/* Sidebar */}
      <aside className="vendeur-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"></path>
            </svg>
          </div>
          <h2>Espace Vendeur</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d={item.icon}></path>
              </svg>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"></path>
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="vendeur-main-content">
        <header className="vendeur-top-header">
          <div className="header-left">
            <h1>Dashboard Vendeur</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-avatar vendeur-avatar">
                {user?.nom?.charAt(0) || 'V'}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.nom || 'Vendeur'}</span>
                <span className="user-role">Vendeur</span>
              </div>
            </div>
          </div>
        </header>

        <div className="vendeur-content-area">
          <Routes>
            <Route path="/" element={<VendeurHome />} />
            <Route path="/analytics" element={<VendeurAnalyticsDashboard />} />
            <Route path="/mes-produits" element={<VendeurMesProduits />} />
            <Route path="/inscrire-produit" element={<VendeurInscrireProduit />} />
            <Route path="/modifier-produit/:id" element={<VendeurModifierProduit />} />
            <Route path="/avis" element={<VendeurAvis />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default VendeurDashboard;
