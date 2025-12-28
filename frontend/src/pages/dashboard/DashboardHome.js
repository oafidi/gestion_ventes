/**
 * DashboardHome - Page d'accueil du Dashboard Admin
 * Design moderne avec statistiques et aperçu rapide
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getKPIsAdmin, getRecommandationsAdmin, formatCurrency } from '../../services/analyticsService';

// Icônes SVG
const Icons = {
  package: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.29 7 12 12 20.71 7"/>
      <line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  ),
  shoppingCart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  dollarSign: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  trendingUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  trendingDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
      <polyline points="17 18 23 18 23 12"/>
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  arrowRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  barChart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  checkCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  alertCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
};

const DashboardHome = () => {
  const [kpis, setKpis] = useState(null);
  const [recommandations, setRecommandations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [kpisData, recommandationsData] = await Promise.all([
          getKPIsAdmin({}),
          getRecommandationsAdmin()
        ]);
        setKpis(kpisData);
        setRecommandations(recommandationsData);
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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">Bienvenue ! Voici un aperçu de votre activité.</p>
        </div>
        <div className="page-header-right">
          <Link to="/dashboard/analytics" className="btn btn-primary">
            {Icons.barChart}
            <span>Analytics détaillés</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card animate-fadeInUp" style={{animationDelay: '0ms'}}>
          <div className="stat-icon success">
            {Icons.dollarSign}
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(kpis?.chiffreAffairesTotal || 0)}</div>
            <div className="stat-label">CA (Commandes livrées)</div>
            {kpis?.tauxCroissanceVentes !== null && (
              <div className={`stat-change ${kpis?.tauxCroissanceVentes >= 0 ? 'positive' : 'negative'}`}>
                {kpis?.tauxCroissanceVentes >= 0 ? Icons.trendingUp : Icons.trendingDown}
                <span>{kpis?.tauxCroissanceVentes >= 0 ? '+' : ''}{kpis?.tauxCroissanceVentes?.toFixed(1)}% vs période précédente</span>
              </div>
            )}
          </div>
        </div>

        <div className="stat-card animate-fadeInUp" style={{animationDelay: '100ms'}}>
          <div className="stat-icon primary">
            {Icons.shoppingCart}
          </div>
          <div className="stat-content">
            <div className="stat-value">{kpis?.nombreTotalVentes || 0}</div>
            <div className="stat-label">Commandes totales</div>
            <div className="stat-sub">
              <span className="stat-detail warning">{kpis?.commandesEnAttente || 0} en attente</span>
            </div>
          </div>
        </div>

        <div className="stat-card animate-fadeInUp" style={{animationDelay: '200ms'}}>
          <div className="stat-icon info">
            {Icons.package}
          </div>
          <div className="stat-content">
            <div className="stat-value">{kpis?.nombreProduitsVendus || 0}</div>
            <div className="stat-label">Produits vendus</div>
            <div className="stat-sub">
              <span className="stat-detail">Prix moyen: {formatCurrency(kpis?.prixMoyenCommande || 0)}</span>
            </div>
          </div>
        </div>

        <div className="stat-card animate-fadeInUp" style={{animationDelay: '300ms'}}>
          <div className="stat-icon warning">
            {Icons.users}
          </div>
          <div className="stat-content">
            <div className="stat-value">{kpis?.noteMoyenneGlobale?.toFixed(1) || 'N/A'}/5</div>
            <div className="stat-label">Note moyenne</div>
            <div className="stat-sub">
              <span className="stat-detail">{kpis?.nombreReviews || 0} avis clients</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Insights et Alertes */}
        <div className="col-8">
          <div className="data-card">
            <div className="data-card-header">
              <h3 className="data-card-title">Insights et Alertes</h3>
              <Link to="/dashboard/analytics" className="btn btn-ghost btn-sm">
                Voir tout
                {Icons.arrowRight}
              </Link>
            </div>
            <div className="data-card-body">
              <div className="insights-list">
                {recommandations?.insights?.slice(0, 3).map((insight, idx) => (
                  <div key={idx} className={`insight-item ${insight.type?.toLowerCase()}`}>
                    <div className="insight-icon">
                      {insight.type === 'SUCCESS' ? Icons.checkCircle : Icons.alertCircle}
                    </div>
                    <div className="insight-content">
                      <p className="insight-title">{insight.titre}</p>
                      <span className="insight-message">{insight.message}</span>
                    </div>
                  </div>
                ))}
                {recommandations?.alertes?.slice(0, 2).map((alerte, idx) => (
                  <div key={`alerte-${idx}`} className={`insight-item warning`}>
                    <div className="insight-icon">
                      {Icons.alertCircle}
                    </div>
                    <div className="insight-content">
                      <p className="insight-title">{alerte.titre}</p>
                      <span className="insight-message">{alerte.message}</span>
                    </div>
                  </div>
                ))}
                {(!recommandations?.insights?.length && !recommandations?.alertes?.length) && (
                  <div className="empty-insights">
                    <p>Aucun insight pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-4">
          <div className="data-card">
            <div className="data-card-header">
              <h3 className="data-card-title">Actions rapides</h3>
            </div>
            <div className="data-card-body">
              <div className="quick-actions">
                <Link to="/dashboard/produits" className="quick-action-btn">
                  {Icons.package}
                  <span>Gérer les produits</span>
                </Link>
                <Link to="/dashboard/categories" className="quick-action-btn">
                  {Icons.grid}
                  <span>Gérer les catégories</span>
                </Link>
                <Link to="/dashboard/commandes" className="quick-action-btn">
                  {Icons.shoppingCart}
                  <span>Voir les commandes</span>
                </Link>
                <Link to="/dashboard/vendeurs" className="quick-action-btn">
                  {Icons.users}
                  <span>Gérer les vendeurs</span>
                </Link>
                <Link to="/dashboard/analytics" className="quick-action-btn highlight">
                  {Icons.barChart}
                  <span>Analytics complets</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline styles */}
      <style>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          color: #6b7280;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #4f46e5;
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-primary:hover {
          background: #4338ca;
        }
        .btn-primary svg {
          width: 18px;
          height: 18px;
        }
        .stat-sub {
          margin-top: 0.5rem;
        }
        .stat-detail {
          font-size: 0.8rem;
          color: #6b7280;
        }
        .stat-detail.warning {
          color: #d97706;
          background: #fef3c7;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
        }
        .insights-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .insight-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 8px;
          background: #f9fafb;
          transition: all 0.2s;
        }
        .insight-item:hover {
          background: #f3f4f6;
        }
        .insight-item.success {
          background: #d1fae5;
          border-left: 4px solid #10b981;
        }
        .insight-item.warning {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
        }
        .insight-item.opportunity {
          background: #dbeafe;
          border-left: 4px solid #3b82f6;
        }
        .insight-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
        }
        .insight-item.success .insight-icon { color: #10b981; }
        .insight-item.warning .insight-icon { color: #f59e0b; }
        .insight-item.opportunity .insight-icon { color: #3b82f6; }
        .insight-content {
          flex: 1;
        }
        .insight-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
        }
        .insight-message {
          font-size: 0.8rem;
          color: #4b5563;
        }
        .empty-insights {
          text-align: center;
          padding: 2rem;
          color: #9ca3af;
        }
        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: #f9fafb;
          border-radius: 8px;
          text-decoration: none;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .quick-action-btn:hover {
          background: #eef2ff;
          color: #4f46e5;
          border-color: #c7d2fe;
        }
        .quick-action-btn svg {
          width: 20px;
          height: 20px;
          color: #6b7280;
        }
        .quick-action-btn:hover svg {
          color: #4f46e5;
        }
        .quick-action-btn.highlight {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
        }
        .quick-action-btn.highlight svg {
          color: white;
        }
        .quick-action-btn.highlight:hover {
          background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
          border-color: transparent;
        }
      `}</style>
    </>
  );
};

export default DashboardHome;