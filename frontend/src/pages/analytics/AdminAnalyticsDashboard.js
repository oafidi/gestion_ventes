/**
 * Dashboard Analytics Admin
 * Vision globale multi-vendeurs et multi-catégories
 * Analyse des performances commerciales de la plateforme
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiDollarSign, 
  FiShoppingCart, 
  FiPackage, 
  FiTrendingUp,
  FiStar,
  FiMessageSquare,
  FiUsers,
  FiDownload,
  FiRefreshCw,
  FiFilter
} from 'react-icons/fi';

import {
  KPICard,
  ProductCard,
  InsightCard,
  LoadingSkeleton,
  SectionHeader,
  DataTable,
  FilterBar,
  FilterGroup,
  DateRangePicker,
  SelectFilter,
  PeriodToggle,
  EmptyState
} from '../../components/analytics/AnalyticsComponents';

import {
  SalesTrendChart,
  TopProductsBarChart,
  CategoryPieChart,
  ComposedSalesChart,
  CategoryComparisonChart,
  VendorPerformanceChart
} from '../../components/analytics/AnalyticsCharts';

import {
  getKPIsAdmin,
  getTendancesAdmin,
  getProduitsAdmin,
  getCategoriesAdmin,
  getVendeursAnalytics,
  getRecommandationsAdmin,
  getExportAdmin,
  formatCurrency,
  formatPercentage,
  getDefaultDateRange,
  exportToCSV
} from '../../services/analyticsService';

import { getAllCategories } from '../../services/categorieService';
import { getAllVendeurs } from '../../services/vendeurService';

import './AnalyticsDashboard.css';

const AdminAnalyticsDashboard = () => {
  // ==================== STATE ====================
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Données
  const [kpis, setKpis] = useState(null);
  const [tendances, setTendances] = useState(null);
  const [produits, setProduits] = useState(null);
  const [categories, setCategories] = useState(null);
  const [vendeurs, setVendeurs] = useState(null);
  const [recommandations, setRecommandations] = useState(null);

  // Filtres
  const [filters, setFilters] = useState({
    ...getDefaultDateRange(),
    categorieId: null,
    vendeurId: null,
    typePeriode: 'JOUR'
  });

  // Options de filtres
  const [categoriesOptions, setCategoriesOptions] = useState([]);
  const [vendeursOptions, setVendeursOptions] = useState([]);

  // Onglet actif
  const [activeTab, setActiveTab] = useState('overview');

  // ==================== CHARGEMENT DES DONNÉES ====================
  
  const loadFilterOptions = useCallback(async () => {
    try {
      const [cats, vends] = await Promise.all([
        getAllCategories(),
        getAllVendeurs()
      ]);
      setCategoriesOptions(cats.map(c => ({ value: c.id, label: c.nom })));
      setVendeursOptions(vends.map(v => ({ value: v.id, label: v.nom })));
    } catch (err) {
      console.error('Erreur chargement options:', err);
    }
  }, []);

  const loadData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [kpisData, tendancesData, produitsData, categoriesData, vendeursData, recommandationsData] = 
        await Promise.all([
          getKPIsAdmin(filters),
          getTendancesAdmin(filters),
          getProduitsAdmin(filters),
          getCategoriesAdmin(filters),
          getVendeursAnalytics(filters),
          getRecommandationsAdmin()
        ]);

      setKpis(kpisData);
      setTendances(tendancesData);
      setProduits(produitsData);
      setCategories(categoriesData);
      setVendeurs(vendeursData);
      setRecommandations(recommandationsData);
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==================== HANDLERS ====================

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleRefresh = () => {
    loadData(true);
  };

  const handleExport = async () => {
    try {
      const data = await getExportAdmin(filters);
      exportToCSV(data, 'rapport-analytics-admin');
    } catch (err) {
      console.error('Erreur export:', err);
    }
  };

  // ==================== RENDER HELPERS ====================

  const renderKPIs = () => {
    if (loading) return <LoadingSkeleton type="kpi" count={6} />;
    if (!kpis) return null;

    return (
      <div className="kpi-grid">
        <KPICard
          title="Chiffre d'affaires"
          value={formatCurrency(kpis.chiffreAffairesTotal)}
          trend={kpis.tauxCroissanceVentes}
          icon={FiDollarSign}
          color="primary"
        />
        <KPICard
          title="Commandes"
          value={kpis.nombreTotalVentes || 0}
          subtitle={`${kpis.commandesEnAttente || 0} en attente`}
          icon={FiShoppingCart}
          color="success"
        />
        <KPICard
          title="Produits vendus"
          value={kpis.nombreProduitsVendus || 0}
          subtitle={`Panier moyen: ${formatCurrency(kpis.prixMoyenCommande)}`}
          icon={FiPackage}
          color="info"
        />
        <KPICard
          title="Croissance"
          value={formatPercentage(kpis.tauxCroissanceVentes)}
          subtitle="vs période précédente"
          icon={FiTrendingUp}
          color={kpis.tauxCroissanceVentes >= 0 ? 'success' : 'danger'}
        />
        <KPICard
          title="Note moyenne"
          value={kpis.noteMoyenneGlobale ? `${kpis.noteMoyenneGlobale.toFixed(1)}/5` : 'N/A'}
          subtitle={`${kpis.nombreTotalReviews || 0} avis`}
          icon={FiStar}
          color="warning"
        />
        <KPICard
          title="Vendeurs actifs"
          value={vendeurs?.nombreVendeursActifs || 0}
          icon={FiUsers}
          color="purple"
        />
      </div>
    );
  };

  const renderTopProducts = () => {
    if (!produits?.top10ParVentes?.length) return null;

    return (
      <div className="top-products-section">
        <SectionHeader 
          title="Top Produits" 
          subtitle="Par nombre de ventes"
        />
        <div className="top-products-grid">
          {produits.top10ParVentes.slice(0, 5).map((product, index) => (
            <ProductCard key={product.vendeurProduitId} product={product} rank={index + 1} />
          ))}
        </div>
      </div>
    );
  };

  const renderInsights = () => {
    if (!recommandations?.insights?.length && !recommandations?.alertes?.length) return null;

    return (
      <div className="insights-section">
        <SectionHeader title="Insights & Alertes" />
        <div className="insights-grid">
          {recommandations.insights?.map((insight, index) => (
            <InsightCard
              key={index}
              type={insight.type}
              title={insight.titre}
              message={insight.message}
              action={insight.action}
            />
          ))}
          {recommandations.alertes?.map((alerte, index) => (
            <InsightCard
              key={`alerte-${index}`}
              type="WARNING"
              title={alerte.titre}
              message={alerte.message}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderProduitsTable = () => {
    if (!produits?.tousLesProduits) return null;

    const columns = [
      { 
        key: 'titre', 
        label: 'Produit', 
        sortable: true,
        render: (value, row) => (
          <div className="product-cell">
            <img 
              src={row.image ? (row.image.startsWith('/uploads') ? `http://localhost:8080${row.image}` : `http://localhost:8080/uploads/vendeur-produits/${row.image}`) : '/placeholder.png'} 
              alt={value}
              className="product-thumb"
            />
            <div>
              <span className="product-name">{value || row.nomProduit}</span>
              <span className="product-category">{row.categorieNom}</span>
            </div>
          </div>
        )
      },
      { key: 'vendeurNom', label: 'Vendeur', sortable: true },
      { 
        key: 'prixVendeur', 
        label: 'Prix', 
        sortable: true,
        render: (value) => formatCurrency(value)
      },
      { key: 'nombreVentes', label: 'Ventes', sortable: true },
      { 
        key: 'chiffreAffaires', 
        label: 'CA', 
        sortable: true,
        render: (value) => formatCurrency(value)
      },
      { 
        key: 'noteMoyenne', 
        label: 'Note', 
        sortable: true,
        render: (value, row) => value ? (
          <span className="rating">
            <FiStar className="star-icon" />
            {value.toFixed(1)} ({row.nombreReviews})
          </span>
        ) : 'N/A'
      },
      { 
        key: 'statut', 
        label: 'Statut',
        render: (value) => (
          <span className={`status-badge status-${value?.toLowerCase()}`}>
            {value === 'EN_CROISSANCE' ? '↑' : value === 'EN_BAISSE' ? '↓' : '→'}
          </span>
        )
      }
    ];

    return (
      <div className="products-table-section">
        <SectionHeader 
          title="Tous les produits" 
          subtitle={`${produits.nombreTotalProduits} produits`}
          action="Exporter"
          onAction={handleExport}
        />
        <DataTable columns={columns} data={produits.tousLesProduits} />
      </div>
    );
  };

  // ==================== RENDER TABS ====================

  const renderOverviewTab = () => (
    <>
      {renderKPIs()}
      
      <div className="charts-grid">
        <div className="chart-card full-width">
          <SectionHeader 
            title="Évolution des ventes" 
            subtitle={`Du ${filters.dateDebut} au ${filters.dateFin}`}
          />
          {loading ? (
            <LoadingSkeleton type="chart" />
          ) : (
            <SalesTrendChart 
              data={tendances?.pointsVente || []}
              comparisonData={tendances?.pointsVenteComparaison || []}
            />
          )}
        </div>

        <div className="chart-card">
          <SectionHeader title="Top 10 Produits (CA)" />
          {loading ? (
            <LoadingSkeleton type="chart" />
          ) : (
            <TopProductsBarChart 
              data={produits?.top10ParCA || []}
              layout="vertical"
            />
          )}
        </div>

        <div className="chart-card">
          <SectionHeader title="Répartition par catégorie" />
          {loading ? (
            <LoadingSkeleton type="chart" />
          ) : (
            <CategoryPieChart data={categories?.categories || []} />
          )}
        </div>
      </div>

      {renderTopProducts()}
      {renderInsights()}
    </>
  );

  const renderProduitsTab = () => (
    <>
      <div className="charts-grid">
        <div className="chart-card">
          <SectionHeader title="Top 10 par Ventes" />
          <TopProductsBarChart 
            data={produits?.top10ParVentes || []}
            dataKey="nombreVentes"
          />
        </div>
        <div className="chart-card">
          <SectionHeader title="Top 10 par Note" />
          <TopProductsBarChart 
            data={produits?.top10ParNote || []}
            dataKey="noteMoyenne"
          />
        </div>
      </div>
      {renderProduitsTable()}
    </>
  );

  const renderCategoriesTab = () => (
    <>
      <div className="charts-grid">
        <div className="chart-card">
          <SectionHeader title="Performance par catégorie" />
          <CategoryComparisonChart data={categories?.categories || []} />
        </div>
        <div className="chart-card">
          <SectionHeader title="Répartition du CA" />
          <CategoryPieChart data={categories?.categories || []} />
        </div>
      </div>

      <div className="categories-cards">
        {categories?.categories?.map(cat => (
          <div key={cat.categorieId} className="category-stat-card">
            <div className="category-header">
              <h4>{cat.categorieNom}</h4>
              <span className={`performance-badge ${cat.performance?.toLowerCase()}`}>
                {cat.performance}
              </span>
            </div>
            <div className="category-stats">
              <div className="stat">
                <span className="label">CA</span>
                <span className="value">{formatCurrency(cat.chiffreAffaires)}</span>
              </div>
              <div className="stat">
                <span className="label">Ventes</span>
                <span className="value">{cat.nombreVentes}</span>
              </div>
              <div className="stat">
                <span className="label">Produits</span>
                <span className="value">{cat.nombreProduits}</span>
              </div>
              <div className="stat">
                <span className="label">Prix moyen</span>
                <span className="value">{formatCurrency(cat.prixMoyen)}</span>
              </div>
            </div>
            <div className="category-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${cat.pourcentageCA || 0}%` }}
              />
              <span className="progress-label">{(cat.pourcentageCA || 0).toFixed(1)}% du CA</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderVendeursTab = () => (
    <>
      <div className="charts-grid">
        <div className="chart-card full-width">
          <SectionHeader title="Top Vendeurs" />
          <VendorPerformanceChart data={vendeurs?.vendeurs || []} />
        </div>
      </div>

      <div className="vendors-grid">
        {vendeurs?.vendeurs?.map(v => (
          <div key={v.vendeurId} className="vendor-card">
            <div className="vendor-header">
              <div className="vendor-avatar">{v.vendeurNom?.charAt(0)}</div>
              <div className="vendor-info">
                <h4>{v.vendeurNom}</h4>
                <span className="vendor-email">{v.email}</span>
              </div>
              <span className={`performance-badge ${v.performance?.toLowerCase().replace('_', '-')}`}>
                {v.performance?.replace('_', ' ')}
              </span>
            </div>
            <div className="vendor-stats">
              <div className="stat">
                <span className="label">CA</span>
                <span className="value">{formatCurrency(v.chiffreAffaires)}</span>
              </div>
              <div className="stat">
                <span className="label">Ventes</span>
                <span className="value">{v.nombreVentes}</span>
              </div>
              <div className="stat">
                <span className="label">Produits</span>
                <span className="value">{v.nombreProduitsApprouves}/{v.nombreProduits}</span>
              </div>
              <div className="stat">
                <span className="label">Note</span>
                <span className="value">
                  {v.noteMoyenne ? `${v.noteMoyenne.toFixed(1)}/5` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // ==================== MAIN RENDER ====================

  if (error) {
    return (
      <div className="analytics-dashboard">
        <EmptyState
          icon={FiRefreshCw}
          title="Erreur de chargement"
          message={error}
          action="Réessayer"
          onAction={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h1>Dashboard Analytics</h1>
          <p>Vue d'ensemble des performances commerciales</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-refresh" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? 'spinning' : ''} />
            Actualiser
          </button>
          <button className="btn-export" onClick={handleExport}>
            <FiDownload />
            Exporter
          </button>
        </div>
      </div>

      {/* Filtres */}
      <FilterBar>
        <FilterGroup label="Période">
          <DateRangePicker
            dateDebut={filters.dateDebut}
            dateFin={filters.dateFin}
            onChange={(dates) => handleFilterChange(dates)}
          />
        </FilterGroup>
        <FilterGroup label="Catégorie">
          <SelectFilter
            value={filters.categorieId}
            options={categoriesOptions}
            onChange={(val) => handleFilterChange({ categorieId: val })}
            placeholder="Toutes les catégories"
          />
        </FilterGroup>
        <FilterGroup label="Vendeur">
          <SelectFilter
            value={filters.vendeurId}
            options={vendeursOptions}
            onChange={(val) => handleFilterChange({ vendeurId: val })}
            placeholder="Tous les vendeurs"
          />
        </FilterGroup>
        <FilterGroup label="Affichage">
          <PeriodToggle
            value={filters.typePeriode}
            onChange={(val) => handleFilterChange({ typePeriode: val })}
          />
        </FilterGroup>
      </FilterBar>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </button>
        <button 
          className={`tab ${activeTab === 'produits' ? 'active' : ''}`}
          onClick={() => setActiveTab('produits')}
        >
          Produits
        </button>
        <button 
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Catégories
        </button>
        <button 
          className={`tab ${activeTab === 'vendeurs' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendeurs')}
        >
          Vendeurs
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'produits' && renderProduitsTab()}
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'vendeurs' && renderVendeursTab()}
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
