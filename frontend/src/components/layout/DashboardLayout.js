/**
 * DashboardLayout - Layout moderne pour l'administration
 * Design unifié avec sidebar, header et navigation
 */

import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardHome } from '../../pages/dashboard';
import { Categories } from '../../pages/categories';
import { Produits } from '../../pages/produits';
import { Vendeurs } from '../../pages/vendeurs';
import { Inscriptions } from '../../pages/inscriptions';
import { CommandesList } from '../../pages/commandes';
import { AdminAnalyticsDashboard } from '../../pages/analytics';
import '../../styles/layout.css';

// Icônes SVG modernes
const Icons = {
  store: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
      <path d="M9 22V12h6v10"/>
    </svg>
  ),
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
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <path d="M9 14l2 2 4-4"/>
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
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  chevronDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
};

// Configuration du menu
const menuSections = [
  {
    title: 'Principal',
    items: [
      { path: '/dashboard', icon: 'home', label: 'Tableau de bord', exact: true },
      { path: '/dashboard/analytics', icon: 'barChart', label: 'Analytics' },
      { path: '/dashboard/categories', icon: 'grid', label: 'Catégories' },
      { path: '/dashboard/produits', icon: 'package', label: 'Produits' },
    ]
  },
  {
    title: 'Gestion',
    items: [
      { path: '/dashboard/vendeurs', icon: 'users', label: 'Vendeurs' },
      { path: '/dashboard/inscriptions', icon: 'clipboard', label: 'Inscriptions' },
      { path: '/dashboard/commandes', icon: 'shoppingCart', label: 'Commandes' },
      { path: '/dashboard/statistiques', icon: 'barChart', label: 'Statistiques' },
    ]
  }
];

// Composants placeholder
const Commandes = () => (
  <>
    <div className="page-header">
      <div className="page-header-left">
        <h1 className="page-title">Commandes</h1>
        <p className="page-subtitle">Gérez les commandes des clients</p>
      </div>
    </div>
    <div className="data-card">
      <div className="data-card-body">
        <div className="empty-state">
          {Icons.shoppingCart}
          <h3 className="empty-state-title">Aucune commande</h3>
          <p className="empty-state-text">Les commandes apparaîtront ici.</p>
        </div>
      </div>
    </div>
  </>
);

const Statistiques = () => (
  <>
    <div className="page-header">
      <div className="page-header-left">
        <h1 className="page-title">Statistiques</h1>
        <p className="page-subtitle">Analysez les performances de votre plateforme</p>
      </div>
    </div>
    <div className="data-card">
      <div className="data-card-body">
        <div className="empty-state">
          {Icons.barChart}
          <h3 className="empty-state-title">Statistiques</h3>
          <p className="empty-state-text">Les analyses seront disponibles bientôt.</p>
        </div>
      </div>
    </div>
  </>
);

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path, exact = false) => {
    if (exact) {
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
            <div className="sidebar-brand-name">Gestion Ventes</div>
            <div className="sidebar-brand-subtitle">Admin Panel</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuSections.map((section, idx) => (
            <div key={idx} className="nav-section">
              <div className="nav-section-title">{section.title}</div>
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {Icons[item.icon]}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.nom?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.nom || 'Administrateur'}</div>
              <div className="sidebar-user-role">Administrateur</div>
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
            <h1 className="header-title">Administration</h1>
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
                {user?.nom?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="header-user-info">
                <div className="header-user-name">{user?.nom || 'Admin'}</div>
                <div className="header-user-role">{user?.email}</div>
              </div>
              <span className="header-user-chevron">{Icons.chevronDown}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/analytics" element={<AdminAnalyticsDashboard />} />
            <Route path="/produits" element={<Produits />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/vendeurs" element={<Vendeurs />} />
            <Route path="/inscriptions" element={<Inscriptions />} />
            <Route path="/commandes" element={<CommandesList />} />
            <Route path="/statistiques" element={<Statistiques />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
