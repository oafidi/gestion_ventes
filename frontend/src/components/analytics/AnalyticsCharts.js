/**
 * Composants de graphiques pour le dashboard analytics
 * Utilise Recharts pour les visualisations
 */
import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import './AnalyticsCharts.css';

// Palette de couleurs moderne
const COLORS = {
  primary: '#4f46e5',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  orange: '#f97316',
  teal: '#14b8a6',
  gray: '#6b7280'
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.warning,
  COLORS.purple,
  COLORS.pink,
  COLORS.orange,
  COLORS.teal
];

// ==================== SALES TREND CHART ====================

/**
 * Graphique de tendance des ventes (courbe)
 * @param {Array} data - Données de ventes
 * @param {Array} comparisonData - Données de comparaison (période précédente)
 * @param {string} dataKey - Clé des données à afficher
 * @param {boolean} showComparison - Afficher la comparaison
 */
export const SalesTrendChart = ({ 
  data = [], 
  comparisonData = [], 
  dataKey = 'chiffreAffaires',
  showComparison = true,
  height = 350
}) => {
  if (!data || data.length === 0) {
    return <ChartEmptyState message="Aucune donnée de vente disponible" />;
  }

  const formatTooltipValue = (value, name) => {
    if (name === 'Chiffre d\'affaires' || name === 'Période précédente') {
      return formatMoney(value);
    }
    return value;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCAComp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.gray} stopOpacity={0.2} />
              <stop offset="95%" stopColor={COLORS.gray} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="periode" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <Tooltip 
            formatter={formatTooltipValue}
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '12px'
            }}
          />
          <Legend />
          {showComparison && comparisonData.length > 0 && (
            <Area
              type="monotone"
              data={comparisonData}
              dataKey={dataKey}
              name="Période précédente"
              stroke={COLORS.gray}
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#colorCAComp)"
            />
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            name="Chiffre d'affaires"
            stroke={COLORS.primary}
            strokeWidth={3}
            fill="url(#colorCA)"
            dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: COLORS.primary }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== BAR CHART (TOP PRODUCTS) ====================

/**
 * Graphique en barres pour le top des produits
 */
export const TopProductsBarChart = ({ 
  data = [], 
  dataKey = 'chiffreAffaires',
  nameKey = 'nomProduit',
  height = 350,
  layout = 'horizontal'
}) => {
  if (!data || data.length === 0) {
    return <ChartEmptyState message="Aucun produit à afficher" />;
  }

  // Préparer les données avec des noms courts
  const chartData = data.map(item => ({
    ...item,
    shortName: truncateName(item[nameKey] || item.titre, 15)
  }));

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={height}>
        {layout === 'horizontal' ? (
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="shortName" 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              angle={-45}
              textAnchor="end"
              interval={0}
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickFormatter={(value) => formatCompactNumber(value)}
            />
            <Tooltip 
              formatter={(value, name) => [formatMoney(value), 'CA']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              labelFormatter={(label) => chartData.find(d => d.shortName === label)?.[nameKey] || label}
            />
            <Bar 
              dataKey={dataKey} 
              fill={COLORS.primary}
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis 
              type="number"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => formatCompactNumber(value)}
            />
            <YAxis 
              dataKey="shortName" 
              type="category"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              width={100}
            />
            <Tooltip 
              formatter={(value, name) => [formatMoney(value), 'CA']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar 
              dataKey={dataKey} 
              fill={COLORS.primary}
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// ==================== PIE/DONUT CHART (CATEGORIES) ====================

/**
 * Graphique en donut pour la répartition par catégorie
 */
export const CategoryPieChart = ({ 
  data = [], 
  dataKey = 'chiffreAffaires',
  nameKey = 'categorieNom',
  height = 350,
  showLabels = true
}) => {
  if (!data || data.length === 0) {
    return <ChartEmptyState message="Aucune catégorie à afficher" />;
  }

  // Filtrer les données avec des valeurs > 0
  const validData = data.filter(item => item[dataKey] > 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.05) return null; // Ne pas afficher si < 5%
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={validData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabels ? renderCustomizedLabel : false}
            outerRadius={120}
            innerRadius={60}
            paddingAngle={2}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {validData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => formatMoney(value)}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend 
            layout="vertical" 
            align="right" 
            verticalAlign="middle"
            formatter={(value) => <span style={{ color: '#374151', fontSize: '13px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== COMPOSED CHART (VENTES + CA) ====================

/**
 * Graphique combiné barres + ligne
 */
export const ComposedSalesChart = ({ 
  data = [], 
  height = 350 
}) => {
  if (!data || data.length === 0) {
    return <ChartEmptyState message="Aucune donnée disponible" />;
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="periode" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            formatter={(value, name) => {
              if (name === 'CA') return [formatMoney(value), name];
              return [value, name];
            }}
          />
          <Legend />
          <Bar 
            yAxisId="left"
            dataKey="chiffreAffaires" 
            name="CA"
            fill={COLORS.primary}
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="nombreVentes" 
            name="Ventes"
            stroke={COLORS.success}
            strokeWidth={3}
            dot={{ fill: COLORS.success, strokeWidth: 2, r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== CATEGORY COMPARISON CHART ====================

/**
 * Graphique de comparaison des catégories
 */
export const CategoryComparisonChart = ({ 
  data = [], 
  height = 350 
}) => {
  if (!data || data.length === 0) {
    return <ChartEmptyState message="Aucune catégorie à comparer" />;
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis 
            type="number"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <YAxis 
            dataKey="categorieNom" 
            type="category"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            width={90}
          />
          <Tooltip 
            formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend />
          <Bar 
            dataKey="pourcentageCA" 
            name="% CA"
            fill={COLORS.primary}
            radius={[0, 4, 4, 0]}
          />
          <Bar 
            dataKey="pourcentageVentes" 
            name="% Ventes"
            fill={COLORS.secondary}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== VENDOR PERFORMANCE CHART ====================

/**
 * Graphique de performance des vendeurs
 */
export const VendorPerformanceChart = ({ 
  data = [], 
  height = 350 
}) => {
  if (!data || data.length === 0) {
    return <ChartEmptyState message="Aucun vendeur à afficher" />;
  }

  // Préparer les données
  const chartData = data.slice(0, 10).map(v => ({
    ...v,
    shortName: truncateName(v.vendeurNom, 12)
  }));

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="shortName" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            angle={-45}
            textAnchor="end"
            interval={0}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'CA') return [formatMoney(value), name];
              return [value, name];
            }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            labelFormatter={(label) => chartData.find(d => d.shortName === label)?.vendeurNom || label}
          />
          <Legend />
          <Bar 
            dataKey="chiffreAffaires" 
            name="CA"
            fill={COLORS.primary}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==================== MINI SPARKLINE ====================

/**
 * Mini graphique sparkline pour les tableaux
 */
export const SparkLine = ({ data = [], color = COLORS.primary, height = 40, width = 100 }) => {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// ==================== EMPTY STATE ====================

const ChartEmptyState = ({ message }) => (
  <div className="chart-empty-state">
    <div className="chart-empty-icon">📊</div>
    <p>{message}</p>
  </div>
);

// ==================== UTILITAIRES ====================

const formatMoney = (value) => {
  if (value === null || value === undefined) return '0 DH';
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatCompactNumber = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

const truncateName = (name, maxLength) => {
  if (!name) return '';
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
};

export default {
  SalesTrendChart,
  TopProductsBarChart,
  CategoryPieChart,
  ComposedSalesChart,
  CategoryComparisonChart,
  VendorPerformanceChart,
  SparkLine,
  COLORS,
  CHART_COLORS
};
