/**
 * Composants réutilisables pour le dashboard analytics
 * Design moderne type SaaS, responsive et modulaire
 */
import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiAlertCircle, FiCheckCircle, FiInfo, FiStar } from 'react-icons/fi';
import { BACKEND_URL } from '../../config/apiConfig';
import './AnalyticsComponents.css';

// ==================== KPI CARD ====================

/**
 * Carte KPI avec indicateur de tendance
 * @param {string} title - Titre du KPI
 * @param {string|number} value - Valeur principale
 * @param {string} subtitle - Sous-titre ou description
 * @param {number} trend - Pourcentage de variation (positif/négatif)
 * @param {string} icon - Icône à afficher
 * @param {string} color - Couleur du thème (primary, success, warning, danger)
 */
export const KPICard = ({ title, value, subtitle, trend, icon: Icon, color = 'primary' }) => {
  const getTrendIcon = () => {
    if (trend === undefined || trend === null) return null;
    if (trend > 0) return <FiTrendingUp className="trend-icon positive" />;
    if (trend < 0) return <FiTrendingDown className="trend-icon negative" />;
    return <FiMinus className="trend-icon neutral" />;
  };

  const getTrendClass = () => {
    if (trend > 0) return 'positive';
    if (trend < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-header">
        {Icon && (
          <div className={`kpi-icon kpi-icon-${color}`}>
            <Icon size={24} />
          </div>
        )}
        <div className="kpi-content">
          <h4 className="kpi-title">{title}</h4>
          <div className="kpi-value">{value}</div>
          {subtitle && <span className="kpi-subtitle">{subtitle}</span>}
        </div>
      </div>
      {trend !== undefined && trend !== null && (
        <div className={`kpi-trend ${getTrendClass()}`}>
          {getTrendIcon()}
          <span>{trend >= 0 ? '+' : ''}{trend.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};

// ==================== STAT CARD (Simple) ====================

export const StatCard = ({ label, value, description, icon: Icon }) => (
  <div className="stat-card">
    <div className="stat-header">
      {Icon && <Icon className="stat-icon" size={20} />}
      <span className="stat-label">{label}</span>
    </div>
    <div className="stat-value">{value}</div>
    {description && <span className="stat-description">{description}</span>}
  </div>
);

// ==================== PRODUCT PERFORMANCE CARD ====================

// Helper pour construire l'URL des images
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads')) return `${BACKEND_URL}${imagePath}`;
  return `${BACKEND_URL}/uploads/vendeur-produits/${imagePath}`;
};

export const ProductCard = ({ product, rank }) => {
  if (!product) return null;

  return (
    <div className="product-card">
      {rank && <div className="product-rank">#{rank}</div>}
      <div className="product-image">
        {product.image ? (
          <img src={getImageUrl(product.image)} alt={product.nomProduit} />
        ) : (
          <div className="product-placeholder">📦</div>
        )}
      </div>
      <div className="product-info">
        <h4 className="product-name">{product.nomProduit || product.titre}</h4>
        <span className="product-category">{product.categorie || product.categorieNom}</span>
        {product.vendeurNom && (
          <span className="product-vendor">par {product.vendeurNom}</span>
        )}
      </div>
      <div className="product-stats">
        {product.chiffreAffaires !== undefined && (
          <div className="product-stat">
            <span className="stat-label">CA</span>
            <span className="stat-value">{formatMoney(product.chiffreAffaires)}</span>
          </div>
        )}
        {product.nombreVentes !== undefined && (
          <div className="product-stat">
            <span className="stat-label">Ventes</span>
            <span className="stat-value">{product.nombreVentes}</span>
          </div>
        )}
        {product.noteMoyenne !== undefined && product.noteMoyenne !== null && (
          <div className="product-stat rating">
            <FiStar className="star-icon" />
            <span className="stat-value">{product.noteMoyenne.toFixed(1)}</span>
            {product.nombreReviews !== undefined && (
              <span className="reviews-count">({product.nombreReviews})</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== ALERT/INSIGHT CARD ====================

export const InsightCard = ({ type, title, message, action, onClick }) => {
  const getIcon = () => {
    switch (type) {
      case 'SUCCESS': return <FiCheckCircle className="insight-icon success" />;
      case 'WARNING': return <FiAlertCircle className="insight-icon warning" />;
      case 'OPPORTUNITY': return <FiTrendingUp className="insight-icon opportunity" />;
      default: return <FiInfo className="insight-icon info" />;
    }
  };

  return (
    <div className={`insight-card insight-${type?.toLowerCase() || 'info'}`}>
      <div className="insight-header">
        {getIcon()}
        <h4 className="insight-title">{title}</h4>
      </div>
      <p className="insight-message">{message}</p>
      {action && (
        <button className="insight-action" onClick={onClick}>
          {action}
        </button>
      )}
    </div>
  );
};

// ==================== ALERT BADGE ====================

export const AlertBadge = ({ type, message, severity }) => {
  const getIcon = () => {
    switch (severity) {
      case 'CRITIQUE': return <FiAlertCircle className="alert-icon" />;
      case 'AVERTISSEMENT': return <FiInfo className="alert-icon" />;
      default: return <FiInfo className="alert-icon" />;
    }
  };

  return (
    <div className={`alert-badge alert-${severity?.toLowerCase() || 'info'}`}>
      {getIcon()}
      <span className="alert-message">{message}</span>
    </div>
  );
};

// ==================== LOADING SKELETON ====================

export const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  if (type === 'kpi') {
    return (
      <div className="skeleton-container kpi-grid">
        {skeletons.map(i => (
          <div key={i} className="skeleton-kpi">
            <div className="skeleton skeleton-icon" />
            <div className="skeleton-content">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-value" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="skeleton-chart">
        <div className="skeleton skeleton-chart-area" />
      </div>
    );
  }

  return (
    <div className="skeleton-container">
      {skeletons.map(i => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-header" />
          <div className="skeleton skeleton-body" />
          <div className="skeleton skeleton-footer" />
        </div>
      ))}
    </div>
  );
};

// ==================== EMPTY STATE ====================

export const EmptyState = ({ icon: Icon, title, message, action, onAction }) => (
  <div className="empty-state">
    {Icon && <Icon className="empty-icon" size={48} />}
    <h3 className="empty-title">{title}</h3>
    <p className="empty-message">{message}</p>
    {action && onAction && (
      <button className="empty-action" onClick={onAction}>
        {action}
      </button>
    )}
  </div>
);

// ==================== SECTION HEADER ====================

export const SectionHeader = ({ title, subtitle, action, onAction, icon: Icon }) => (
  <div className="section-header">
    <div className="section-info">
      <h2 className="section-title">
        {Icon && <Icon className="section-icon" size={20} />}
        {title}
      </h2>
      {subtitle && <span className="section-subtitle">{subtitle}</span>}
    </div>
    {action && onAction && (
      <button className="section-action" onClick={onAction}>
        {action}
      </button>
    )}
  </div>
);

// ==================== DATA TABLE ====================

export const DataTable = ({ columns, data, onRowClick, sortColumn, sortOrder, onSort }) => {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="Aucune donnée"
        message="Il n'y a pas de données à afficher pour le moment."
      />
    );
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                onClick={() => col.sortable && onSort && onSort(col.key)}
                className={col.sortable ? 'sortable' : ''}
              >
                {col.label}
                {col.sortable && sortColumn === col.key && (
                  <span className="sort-indicator">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} onClick={() => onRowClick && onRowClick(row)}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ==================== FILTER BAR ====================

export const FilterBar = ({ children }) => (
  <div className="filter-bar">
    {children}
  </div>
);

export const FilterGroup = ({ label, children }) => (
  <div className="filter-group">
    {label && <label className="filter-label">{label}</label>}
    {children}
  </div>
);

export const DateRangePicker = ({ dateDebut, dateFin, onChange }) => (
  <div className="date-range-picker">
    <input
      type="date"
      value={dateDebut}
      onChange={(e) => onChange({ dateDebut: e.target.value, dateFin })}
      className="date-input"
    />
    <span className="date-separator">→</span>
    <input
      type="date"
      value={dateFin}
      onChange={(e) => onChange({ dateDebut, dateFin: e.target.value })}
      className="date-input"
    />
  </div>
);

export const SelectFilter = ({ value, options, onChange, placeholder }) => (
  <select
    value={value || ''}
    onChange={(e) => onChange(e.target.value || null)}
    className="select-filter"
  >
    <option value="">{placeholder || 'Tous'}</option>
    {options.map((opt, index) => (
      <option key={index} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

export const PeriodToggle = ({ value, onChange }) => {
  const options = [
    { value: 'JOUR', label: 'Jour' },
    { value: 'SEMAINE', label: 'Semaine' },
    { value: 'MOIS', label: 'Mois' }
  ];

  return (
    <div className="period-toggle">
      {options.map(opt => (
        <button
          key={opt.value}
          className={`period-btn ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

// ==================== UTILITAIRES ====================

const formatMoney = (value) => {
  if (value === null || value === undefined) return '0 DH';
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value) + ' DH';
};

export default {
  KPICard,
  StatCard,
  ProductCard,
  InsightCard,
  AlertBadge,
  LoadingSkeleton,
  EmptyState,
  SectionHeader,
  DataTable,
  FilterBar,
  FilterGroup,
  DateRangePicker,
  SelectFilter,
  PeriodToggle
};
