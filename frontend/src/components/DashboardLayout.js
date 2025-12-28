/**
 * DashboardLayout - Layout moderne et réutilisable
 * Utilisé pour Admin et Vendeur avec la même structure
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

// Icônes SVG inline pour éviter les dépendances
const Icons = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  package: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4 7.55 4.24"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.29 7 12 12 20.71 7"/>
      <line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  shoppingCart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  barChart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  logOut: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  chevronDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  store: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
      <path d="M9 22V12h6v10"/>
    </svg>
  )
};

// Configuration des menus par rôle
const menuConfig = {
  ADMIN: {
    brandName: 'Gestion Ventes',
    brandSubtitle: 'Admin Panel',
    sections: [
      {
        title: 'Principal',
        items: [
          { path: '/dashboard', icon: 'home', label: 'Dashboard' },
          { path: '/dashboard/analytics', icon: 'barChart', label: 'Analytics', badge: 'Nouveau' },
          { path: '/dashboard/categories', icon: 'grid', label: 'Catégories' },
          { path: '/dashboard/produits', icon: 'package', label: 'Produits' },
          { path: '/dashboard/vendeurs', icon: 'users', label: 'Vendeurs' },
        ]
      },
      {
        title: 'Gestion',
        items: [
          { path: '/dashboard/commandes', icon: 'shoppingCart', label: 'Commandes' },
          { path: '/dashboard/statistiques', icon: 'barChart', label: 'Statistiques' },
        ]
      }
    ]
  },
  VENDEUR: {
    brandName: 'Espace Vendeur',
    brandSubtitle: 'Mon Commerce',
    sections: [
      {
        title: 'Mon Espace',
        items: [
          { path: '/vendeur/dashboard', icon: 'home', label: 'Accueil' },
          { path: '/vendeur/dashboard/analytics', icon: 'barChart', label: 'Mon Analytics', badge: 'Nouveau' },
          { path: '/vendeur/dashboard/mes-produits', icon: 'package', label: 'Mes Produits' },
          { path: '/vendeur/dashboard/inscrire-produit', icon: 'plus', label: 'Nouveau Produit' },
        ]
      }
    ]
  }
};

const DashboardLayout = ({ children, role = 'ADMIN' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const config = menuConfig[role] || menuConfig.ADMIN;

  const handleLogout = () => {
    logout();
    navigate(role === 'VENDEUR' ? '/vendeur/login' : '/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard' || path === '/vendeur/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            {Icons.store}
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">{config.brandName}</div>
            <div className="sidebar-brand-subtitle">{config.brandSubtitle}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {config.sections.map((section, idx) => (
            <div key={idx} className="nav-section">
              <div className="nav-section-title">{section.title}</div>
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {Icons[item.icon]}
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.nom?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.nom || 'Utilisateur'}</div>
              <div className="sidebar-user-role">{role === 'VENDEUR' ? 'Vendeur' : 'Administrateur'}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            {Icons.logOut}
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? Icons.x : Icons.menu}
            </button>
            <h1 className="header-title">{config.brandName}</h1>
          </div>

          <div className="header-right">
            {/* Search */}
            <div className="header-search">
              {Icons.search}
              <input type="text" placeholder="Rechercher..." />
            </div>

            {/* Notifications */}
            <div className="header-notifications">
              <button className="btn-notification">
                {Icons.bell}
                <span className="notification-badge">3</span>
              </button>
            </div>

            {/* User */}
            <div className="header-user">
              <div className="header-user-avatar">
                {user?.nom?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="header-user-info">
                <div className="header-user-name">{user?.nom || 'Utilisateur'}</div>
                <div className="header-user-role">{user?.email}</div>
              </div>
              <span className="header-user-chevron">{Icons.chevronDown}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
