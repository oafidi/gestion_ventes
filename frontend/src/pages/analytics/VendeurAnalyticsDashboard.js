/**
 * Dashboard Analytics Vendeur
 * Vision personnalisée des performances du vendeur connecté
 * Analyse des produits, recommandations et insights
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiDollarSign, 
  FiShoppingCart, 
  FiPackage, 
  FiTrendingUp,
  FiStar,
  FiMessageSquare,
  FiDownload,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiTarget,
  FiZap,
  FiBox,
  FiBarChart2,
  FiPieChart,
  FiClipboard
} from 'react-icons/fi';

import {
  KPICard,
  ProductCard,
  InsightCard,
  AlertBadge,
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
  ComposedSalesChart
} from '../../components/analytics/AnalyticsCharts';

import {
  getKPIsVendeur,
  getTendancesVendeur,
  getProduitsVendeur,
  getCategoriesVendeur,
  getRecommandationsVendeur,
  getCommandesVendeur,
  getExportVendeur,
  formatCurrency,
  formatPercentage,
  getDefaultDateRange,
  exportToCSV
} from '../../services/analyticsService';

import { getAllCategories } from '../../services/categorieService';
import { BACKEND_URL } from '../../config/apiConfig';

import './AnalyticsDashboard.css';

const VendeurAnalyticsDashboard = () => {
  const navigate = useNavigate();
  
  // ==================== STATE ====================
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Données
  const [kpis, setKpis] = useState(null);
  const [tendances, setTendances] = useState(null);
  const [produits, setProduits] = useState(null);
  const [categories, setCategories] = useState(null);
  const [recommandations, setRecommandations] = useState(null);
  const [commandes, setCommandes] = useState(null);
  const [commandesFilter, setCommandesFilter] = useState('');

  // Filtres
  const [filters, setFilters] = useState({
    ...getDefaultDateRange(),
    categorieId: null,
    typePeriode: 'JOUR'
  });

  // Options de filtres
  const [categoriesOptions, setCategoriesOptions] = useState([]);

  // Onglet actif
  const [activeTab, setActiveTab] = useState('overview');

  // ==================== CHARGEMENT DES DONNÉES ====================
  
  const loadFilterOptions = useCallback(async () => {
    try {
      const cats = await getAllCategories();
      setCategoriesOptions(cats.map(c => ({ value: c.id, label: c.nom })));
    } catch (err) {
      console.error('Erreur chargement options:', err);
    }
  }, []);

  const loadCommandes = useCallback(async () => {
    try {
      const data = await getCommandesVendeur({ 
        statut: commandesFilter,
        dateDebut: filters.dateDebut,
        dateFin: filters.dateFin
      });
      setCommandes(data);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
    }
  }, [commandesFilter, filters.dateDebut, filters.dateFin]);

  const loadData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [kpisData, tendancesData, produitsData, categoriesData, recommandationsData, commandesData] = 
        await Promise.all([
          getKPIsVendeur(filters),
          getTendancesVendeur(filters),
          getProduitsVendeur(filters),
          getCategoriesVendeur(filters),
          getRecommandationsVendeur(),
          getCommandesVendeur({ dateDebut: filters.dateDebut, dateFin: filters.dateFin })
        ]);

      setKpis(kpisData);
      setTendances(tendancesData);
      setProduits(produitsData);
      setCategories(categoriesData);
      setRecommandations(recommandationsData);
      setCommandes(commandesData);
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
      const data = await getExportVendeur(filters);
      exportToCSV(data, 'rapport-mes-ventes');
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
          title="Mon chiffre d'affaires"
          value={formatCurrency(kpis.chiffreAffairesTotal)}
          trend={kpis.tauxCroissanceVentes}
          icon={FiDollarSign}
          color="primary"
        />
        <KPICard
          title="Mes commandes"
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
          title="Ma note moyenne"
          value={kpis.noteMoyenneGlobale ? `${kpis.noteMoyenneGlobale.toFixed(1)}/5` : 'N/A'}
          subtitle={`${kpis.nombreTotalReviews || 0} avis clients`}
          icon={FiStar}
          color="warning"
        />
        <KPICard
          title="Avis reçus"
          value={kpis.nombreTotalReviews || 0}
          icon={FiMessageSquare}
          color="purple"
        />
      </div>
    );
  };

  const renderBestSeller = () => {
    if (!kpis?.produitPlusVendu) return null;

    return (
      <div className="highlight-card best-seller">
        <div className="highlight-icon">
          <FiZap />
        </div>
        <div className="highlight-content">
          <span className="highlight-label">Produit vedette</span>
          <h3>{kpis.produitPlusVendu.nomProduit}</h3>
          <div className="highlight-stats">
            <span>{kpis.produitPlusVendu.nombreVentes} ventes</span>
            <span>{formatCurrency(kpis.produitPlusVendu.chiffreAffaires)} CA</span>
          </div>
        </div>
        {kpis.produitPlusVendu.image && (
          <img 
            src={kpis.produitPlusVendu.image.startsWith('/uploads') ? `\`\$\{BACKEND_URL\}${kpis.produitPlusVendu.image}` : `\`\$\{BACKEND_URL\}/uploads/vendeur-produits/${kpis.produitPlusVendu.image}`}
            alt={kpis.produitPlusVendu.nomProduit}
            className="highlight-image"
          />
        )}
      </div>
    );
  };

  const renderTopRated = () => {
    if (!kpis?.produitMieuxNote) return null;

    return (
      <div className="highlight-card top-rated">
        <div className="highlight-icon">
          <FiStar />
        </div>
        <div className="highlight-content">
          <span className="highlight-label">Mieux noté</span>
          <h3>{kpis.produitMieuxNote.nomProduit}</h3>
          <div className="highlight-stats">
            <span>
              <FiStar className="star-inline" />
              {kpis.produitMieuxNote.noteMoyenne?.toFixed(1)}/5
            </span>
            <span>{kpis.produitMieuxNote.nombreReviews} avis</span>
          </div>
        </div>
        {kpis.produitMieuxNote.image && (
          <img 
            src={kpis.produitMieuxNote.image.startsWith('/uploads') ? `\`\$\{BACKEND_URL\}${kpis.produitMieuxNote.image}` : `\`\$\{BACKEND_URL\}/uploads/vendeur-produits/${kpis.produitMieuxNote.image}`}
            alt={kpis.produitMieuxNote.nomProduit}
            className="highlight-image"
          />
        )}
      </div>
    );
  };

  const renderAlerts = () => {
    if (!recommandations?.alertes?.length) return null;

    return (
      <div className="alerts-section">
        <SectionHeader 
          title="Alertes" 
          subtitle="Actions recommandées"
          icon={FiAlertTriangle}
        />
        <div className="alerts-list">
          {recommandations.alertes.map((alerte, index) => (
            <AlertBadge
              key={index}
              type={alerte.type}
              message={alerte.message}
              severity={alerte.severite}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderOpportunites = () => {
    if (!recommandations?.produitsFortPotentiel?.length) return null;

    return (
      <div className="opportunities-section">
        <SectionHeader 
          title="Opportunités détectées" 
          subtitle="Produits à fort potentiel inexploité"
        />
        <div className="opportunities-grid">
          {recommandations.produitsFortPotentiel.map((produit, index) => (
            <div key={index} className="opportunity-card">
              <div className="opportunity-header">
                <FiTarget className="opportunity-icon" />
                <h4>{produit.nomProduit}</h4>
              </div>
              <p className="opportunity-reason">{produit.raison}</p>
              <div className="opportunity-stats">
                <span>
                  <FiStar /> {produit.noteMoyenne?.toFixed(1)}/5 ({produit.nombreReviews} avis)
                </span>
                <span>Seulement {produit.nombreVentes} ventes</span>
              </div>
              <div className="opportunity-suggestion">
                <FiCheckCircle />
                <span>{produit.suggestion}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProduitsAmeliorer = () => {
    if (!recommandations?.produitsAAmeliorer?.length) return null;

    return (
      <div className="improve-section">
        <SectionHeader 
          title="Produits à améliorer" 
          subtitle="Ces produits se vendent mais ont des avis mitigés"
        />
        <div className="improve-grid">
          {recommandations.produitsAAmeliorer.map((produit, index) => (
            <div key={index} className="improve-card">
              <h4>{produit.nomProduit}</h4>
              <p className="problem">{produit.probleme}</p>
              <p className="suggestion">{produit.suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderInsights = () => {
    if (!recommandations?.insights?.length) return null;

    return (
      <div className="insights-section">
        <SectionHeader title="Insights" />
        <div className="insights-grid">
          {recommandations.insights.map((insight, index) => (
            <InsightCard
              key={index}
              type={insight.type}
              title={insight.titre}
              message={insight.message}
              action={insight.action}
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
              src={row.image ? (row.image.startsWith('/uploads') ? `\`\$\{BACKEND_URL\}${row.image}` : `\`\$\{BACKEND_URL\}/uploads/vendeur-produits/${row.image}`) : '/placeholder.png'} 
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
        key: 'quantiteStock', 
        label: 'Stock',
        render: (value) => (
          <span className={`stock-badge ${value < 5 ? 'low' : value < 20 ? 'medium' : 'high'}`}>
            {value}
          </span>
        )
      },
      { 
        key: 'estApprouve', 
        label: 'Statut',
        render: (value) => (
          <span className={`status-badge ${value ? 'approved' : 'pending'}`}>
            {value ? 'Approuvé' : 'En attente'}
          </span>
        )
      }
    ];

    return (
      <div className="products-table-section">
        <SectionHeader 
          title="Mes produits" 
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
      
      <div className="highlights-row">
        {renderBestSeller()}
        {renderTopRated()}
      </div>

      {renderAlerts()}
      
      <div className="charts-grid">
        <div className="chart-card full-width">
          <SectionHeader 
            title="Évolution de mes ventes" 
            subtitle={`Du ${filters.dateDebut} au ${filters.dateFin}`}
          />
          {loading ? (
            <LoadingSkeleton type="chart" />
          ) : (
            <ComposedSalesChart data={tendances?.pointsVente || []} />
          )}
        </div>

        <div className="chart-card">
          <SectionHeader title="Mes meilleurs produits" />
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
          <SectionHeader title="Mes catégories" />
          {loading ? (
            <LoadingSkeleton type="chart" />
          ) : (
            <CategoryPieChart data={categories?.categories || []} />
          )}
        </div>
      </div>

      {renderInsights()}
    </>
  );

  const renderRecommandationsTab = () => (
    <>
      {/* Section: Nouveaux produits à vendre */}
      {recommandations?.produitsFortPotentiel?.length > 0 && (
        <div className="new-products-section">
          <SectionHeader 
            title="Nouveaux produits recommandés"
            icon={FiBox}
            subtitle="Produits populaires que vous ne vendez pas encore"
          />
          <div className="new-products-grid">
            {recommandations.produitsFortPotentiel.map((produit, index) => (
              <div key={index} className="new-product-card">
                <div className="new-product-header">
                  <span className="rank-badge">#{index + 1}</span>
                  <h4>{produit.nomProduit}</h4>
                </div>
                <div className="new-product-category">{produit.categorie}</div>
                <div className="new-product-stats">
                  <div className="stat-item">
                    <FiShoppingCart />
                    <span>{produit.nombreVentes} ventes</span>
                  </div>
                  {produit.noteMoyenne && (
                    <div className="stat-item">
                      <FiStar />
                      <span>{produit.noteMoyenne.toFixed(1)}/5</span>
                    </div>
                  )}
                </div>
                <p className="new-product-reason">{produit.raison}</p>
                <div className="new-product-suggestion">
                  <FiCheckCircle />
                  <span>{produit.suggestion}</span>
                </div>
                <button 
                  className="btn-inscription"
                  onClick={() => navigate('/vendeur/inscrire-produit', { state: { produitId: produit.produitId, produitNom: produit.nomProduit } })}
                >
                  S'inscrire à ce produit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Insights et recommandations de prix */}
      {recommandations?.insights?.length > 0 && (
        <div className="price-insights-section">
          <SectionHeader 
            title="Recommandations de prix"
            icon={FiDollarSign}
            subtitle="Optimisez vos prix pour maximiser vos ventes"
          />
          <div className="insights-grid">
            {recommandations.insights.map((insight, index) => (
              <InsightCard
                key={index}
                type={insight.type}
                title={insight.titre}
                message={insight.message}
                action={insight.action}
              />
            ))}
          </div>
        </div>
      )}

      {/* Section: Opportunités d'expansion */}
      {recommandations?.opportunites?.length > 0 && (
        <div className="expansion-section">
          <SectionHeader 
            title="Opportunités d'expansion"
            icon={FiTrendingUp}
            subtitle="Étendez votre gamme de produits"
          />
          <div className="opportunities-grid">
            {recommandations.opportunites.map((opp, index) => (
              <div key={index} className={`opportunity-card priority-${opp.priorite?.toLowerCase()}`}>
                <div className="opportunity-header">
                  <span className="opportunity-type">{opp.type}</span>
                  <span className={`priority-badge ${opp.priorite?.toLowerCase()}`}>
                    {opp.priorite}
                  </span>
                </div>
                <h4>{opp.titre}</h4>
                <p>{opp.description}</p>
                {opp.potentielEstime && (
                  <div className="potential-gain">
                    <FiTrendingUp />
                    Gain potentiel: {formatCurrency(opp.potentielEstime)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Produits à améliorer */}
      {renderProduitsAmeliorer()}
      
      {/* Section: Catégories tendance */}
      {recommandations?.categoriesTendance?.length > 0 && (
        <div className="trends-section">
          <SectionHeader 
            title="Analyse de vos catégories"
            icon={FiPieChart}
            subtitle="Performance par catégorie"
          />
          <div className="trends-grid">
            {recommandations.categoriesTendance.map((cat, index) => (
              <div key={index} className={`trend-card trend-${cat.tendance?.toLowerCase().replace('_', '-')}`}>
                <div className="trend-header">
                  <h4>{cat.categorieNom}</h4>
                  <span className={`trend-badge ${cat.tendance?.toLowerCase().replace('_', '-')}`}>
                    {cat.tendance === 'EN_HAUSSE' ? '↑' : cat.tendance === 'EN_BAISSE' ? '↓' : '→'}
                    {cat.tauxCroissance ? ` ${cat.tauxCroissance.toFixed(1)}%` : ''}
                  </span>
                </div>
                <p>{cat.opportunite}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message si pas de recommandations */}
      {!recommandations?.produitsFortPotentiel?.length && 
       !recommandations?.insights?.length && 
       !recommandations?.opportunites?.length && (
        <EmptyState
          icon={FiTarget}
          title="Pas de recommandations pour le moment"
          message="Continuez à développer votre activité pour recevoir des recommandations personnalisées."
        />
      )}
    </>
  );

  const renderCommandesTab = () => {
    const getStatutBadgeClass = (statut) => {
      switch(statut) {
        case 'EN_ATTENTE': return 'status-pending';
        case 'CONFIRMEE': return 'status-confirmed';
        case 'LIVREE': return 'status-delivered';
        case 'ANNULEE': return 'status-cancelled';
        default: return '';
      }
    };

    const getStatutLabel = (statut) => {
      switch(statut) {
        case 'EN_ATTENTE': return 'En attente';
        case 'CONFIRMEE': return 'Confirmée';
        case 'LIVREE': return 'Livrée';
        case 'ANNULEE': return 'Annulée';
        default: return statut;
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    const handleStatutChange = async (newStatut) => {
      setCommandesFilter(newStatut);
      try {
        const data = await getCommandesVendeur({ 
          statut: newStatut,
          dateDebut: filters.dateDebut,
          dateFin: filters.dateFin
        });
        setCommandes(data);
      } catch (err) {
        console.error('Erreur chargement commandes:', err);
      }
    };

    return (
      <>
        {/* KPIs Commandes */}
        <div className="kpi-grid">
          <KPICard
            title="Total Commandes"
            value={commandes?.totalCommandes || 0}
            subtitle="Toutes les commandes"
            icon={FiShoppingCart}
            color="primary"
          />
          <KPICard
            title="CA (Livrées)"
            value={formatCurrency(commandes?.totalCA)}
            subtitle="Marge sur commandes livrées"
            icon={FiDollarSign}
            color="success"
          />
          <KPICard
            title="En attente"
            value={commandes?.enAttente || 0}
            icon={FiPackage}
            color="warning"
          />
          <KPICard
            title="Livrées"
            value={commandes?.livrees || 0}
            icon={FiCheckCircle}
            color="info"
          />
        </div>

        {/* Filtre par statut */}
        <div className="commandes-filter">
          <label>Filtrer par statut:</label>
          <select 
            value={commandesFilter} 
            onChange={(e) => handleStatutChange(e.target.value)}
            className="select-filter"
          >
            <option value="">Tous</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="CONFIRMEE">Confirmée</option>
            <option value="EN_COURS_LIVRAISON">En cours de livraison</option>
            <option value="LIVREE">Livrée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>

        {/* Liste des commandes */}
        <div className="commandes-section">
          <SectionHeader 
            title="Mes commandes"
            icon={FiClipboard}
            subtitle={`${commandes?.commandes?.length || 0} commande(s) affichée(s)`}
          />
          
          {!commandes?.commandes?.length ? (
            <EmptyState
              icon={FiShoppingCart}
              title="Aucune commande"
              message={commandesFilter ? `Aucune commande avec le statut "${getStatutLabel(commandesFilter)}"` : "Vous n'avez pas encore de commandes pour vos produits."}
            />
          ) : (
            <div className="commandes-list">
              {commandes.commandes.map((commande) => (
                <div key={commande.id} className="commande-card">
                  <div className="commande-header">
                    <div className="commande-info">
                      <span className="commande-id">Commande #{commande.id}</span>
                      <span className="commande-date">{formatDate(commande.dateCommande)}</span>
                    </div>
                    <span className={`status-badge ${getStatutBadgeClass(commande.statut)}`}>
                      {getStatutLabel(commande.statut)}
                    </span>
                  </div>
                  
                  <div className="commande-client">
                    <strong>Client:</strong> {commande.clientNom}
                    <br />
                    <small>{commande.clientEmail}</small>
                    {commande.adresseLivraison && (
                      <>
                        <br />
                        <small>Livraison: {commande.adresseLivraison}</small>
                      </>
                    )}
                  </div>

                  <div className="commande-produits">
                    <strong>Vos produits dans cette commande:</strong>
                    <div className="produits-list">
                      {commande.lignesCommande.map((ligne, idx) => (
                        <div key={idx} className="ligne-commande">
                          <div className="ligne-image">
                            {ligne.produitImage ? (
                              <img 
                                src={ligne.produitImage.startsWith('/uploads') ? `\`\$\{BACKEND_URL\}${ligne.produitImage}` : `\`\$\{BACKEND_URL\}/uploads/vendeur-produits/${ligne.produitImage}`}
                                alt={ligne.produitNom}
                              />
                            ) : (
                              <div className="placeholder-img">
                                <FiPackage />
                              </div>
                            )}
                          </div>
                          <div className="ligne-details">
                            <span className="ligne-nom">{ligne.produitNom}</span>
                            <span className="ligne-qty">x{ligne.quantite}</span>
                            <span className="ligne-prix-detail">
                              Prix original: {formatCurrency(ligne.prixOriginal)} | 
                              Votre prix: {formatCurrency(ligne.prixVendeur)}
                            </span>
                          </div>
                          {commande.statut === 'LIVREE' && (
                            <div className="ligne-marge">
                              <span className="marge-label">Marge</span>
                              <span className={`marge-value ${ligne.margeLigne >= 0 ? 'positive' : 'negative'}`}>
                                {ligne.margeLigne >= 0 ? '+' : ''}{formatCurrency(ligne.margeLigne)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="commande-footer">
                    <div className="commande-montants">
                      <div className="montant-item">
                        <span>Ventes:</span>
                        <span>{formatCurrency(commande.montantVendu)}</span>
                      </div>
                      {commande.statut === 'LIVREE' && (
                        <div className="montant-item marge-total">
                          <span>Votre marge:</span>
                          <strong className={commande.margeVendeur >= 0 ? 'positive' : 'negative'}>
                            {commande.margeVendeur >= 0 ? '+' : ''}{formatCurrency(commande.margeVendeur)}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderProduitsTab = () => (
    <>
      <div className="charts-grid">
        <div className="chart-card">
          <SectionHeader title="Par nombre de ventes" />
          <TopProductsBarChart 
            data={produits?.top10ParVentes || []}
            dataKey="nombreVentes"
          />
        </div>
        <div className="chart-card">
          <SectionHeader title="Par note moyenne" />
          <TopProductsBarChart 
            data={produits?.top10ParNote || []}
            dataKey="noteMoyenne"
          />
        </div>
      </div>
      {renderProduitsTable()}
    </>
  );

  // ==================== MAIN RENDER ====================

  if (error) {
    return (
      <div className="analytics-dashboard vendeur">
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
    <div className="analytics-dashboard vendeur">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-info">
          <h1>Mon Dashboard</h1>
          <p>Analysez vos performances et découvrez des opportunités</p>
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
            placeholder="Toutes mes catégories"
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
          className={`tab ${activeTab === 'commandes' ? 'active' : ''}`}
          onClick={() => setActiveTab('commandes')}
        >
          <FiClipboard />
          Mes Commandes
        </button>
        <button 
          className={`tab ${activeTab === 'recommandations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommandations')}
        >
          <FiZap />
          Recommandations
        </button>
        <button 
          className={`tab ${activeTab === 'produits' ? 'active' : ''}`}
          onClick={() => setActiveTab('produits')}
        >
          Mes Produits
        </button>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'commandes' && renderCommandesTab()}
        {activeTab === 'recommandations' && renderRecommandationsTab()}
        {activeTab === 'produits' && renderProduitsTab()}
      </div>
    </div>
  );
};

export default VendeurAnalyticsDashboard;
