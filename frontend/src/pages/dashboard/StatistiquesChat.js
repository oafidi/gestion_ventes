/**
 * Page Statistiques avec Chat IA
 * Permet de demander des KPIs et graphiques en langage naturel
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  FiSend, 
  FiX, 
  FiBarChart2, 
  FiPieChart, 
  FiTrendingUp,
  FiMessageSquare,
  FiCpu,
  FiUser,
  FiTrash2,
  FiRefreshCw,
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiPackage
} from 'react-icons/fi';
import { AI_SERVICE_URL } from '../../config/apiConfig';
import './StatistiquesChat.css';

// Couleurs pour les graphiques
const CHART_COLORS = [
  '#ff6b35', '#0f172a', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f43f5e', '#6366f1'
];

// Composant KPI Card
const KPICard = ({ title, value, formatted, icon: Icon, description }) => (
  <div className="stats-kpi-card">
    <div className="stats-kpi-icon">
      {Icon && <Icon />}
    </div>
    <div className="stats-kpi-content">
      <span className="stats-kpi-value">{formatted || value}</span>
      <span className="stats-kpi-title">{title}</span>
      {description && <span className="stats-kpi-desc">{description}</span>}
    </div>
  </div>
);

// Composant Chart avec bouton de suppression
const ChartCard = ({ chart, onRemove }) => {
  const { type, chart_type, title, description, data, id } = chart;

  const renderChart = () => {
    if (!data || !data.labels || data.labels.length === 0) {
      return (
        <div className="chart-empty">
          <FiBarChart2 size={48} />
          <p>Aucune donnée disponible</p>
        </div>
      );
    }

    const chartData = data.labels.map((label, index) => ({
      name: label,
      value: data.values[index] || 0
    }));

    switch (chart_type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  background: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="value" fill="#ff6b35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  background: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#ff6b35" 
                strokeWidth={3}
                dot={{ fill: '#ff6b35', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={chart_type === 'donut' ? 60 : 0}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={true}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#ff6b35" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const getChartIcon = () => {
    switch (chart_type) {
      case 'pie':
      case 'donut':
        return <FiPieChart />;
      case 'line':
        return <FiTrendingUp />;
      default:
        return <FiBarChart2 />;
    }
  };

  return (
    <div className="stats-chart-card">
      <div className="stats-chart-header">
        <div className="stats-chart-title">
          {getChartIcon()}
          <span>{title}</span>
        </div>
        <button className="stats-chart-remove" onClick={() => onRemove(id)}>
          <FiX />
        </button>
      </div>
      {description && <p className="stats-chart-desc">{description}</p>}
      <div className="stats-chart-content">
        {renderChart()}
      </div>
    </div>
  );
};

// Composant principal
const StatistiquesChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Bonjour ! Je suis votre assistant analytique. Demandez-moi des KPIs ou des graphiques en langage naturel.\n\nExemples :\n• \"Quel est le chiffre d'affaires total ?\"\n• \"Montre les ventes par catégorie en camembert\"\n• \"Top 5 des produits les plus vendus\"\n• \"Évolution des commandes par mois\"",
      timestamp: new Date()
    }
  ]);
  const [charts, setCharts] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestions = [
    "Chiffre d'affaires total",
    "Ventes par catégorie",
    "Top 5 produits",
    "Nombre de commandes",
    "Évolution mensuelle des ventes"
  ];

  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${AI_SERVICE_URL}/analytics/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: messageText.trim() })
      });

      const result = await response.json();

      if (result.type === 'error') {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: result.message || result.description || "Désolé, je n'ai pas pu traiter votre demande.",
          isError: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } else if (result.type === 'kpi') {
        // Afficher le KPI dans le chat
        const kpiMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: result.message,
          kpiData: {
            title: result.title,
            value: result.data?.value || result.data,
            formatted: result.data?.formatted,
            description: result.description
          },
          timestamp: new Date()
        };
        setMessages(prev => [...prev, kpiMessage]);
      } else if (result.type === 'chart') {
        // Ajouter le graphique à la zone de graphiques
        const newChart = {
          id: Date.now(),
          ...result
        };
        setCharts(prev => [...prev, newChart]);

        const chartMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: result.message || `J'ai généré le graphique "${result.title}". Vous pouvez le voir dans la zone à gauche.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, chartMessage]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "Désolé, une erreur s'est produite. Vérifiez que le service AI est en cours d'exécution.",
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRemoveChart = (chartId) => {
    setCharts(prev => prev.filter(chart => chart.id !== chartId));
  };

  const handleClearCharts = () => {
    setCharts([]);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getKpiIcon = (title) => {
    const lowerTitle = title?.toLowerCase() || '';
    if (lowerTitle.includes('chiffre') || lowerTitle.includes('vente') || lowerTitle.includes('revenu')) {
      return FiDollarSign;
    }
    if (lowerTitle.includes('commande')) {
      return FiShoppingCart;
    }
    if (lowerTitle.includes('client') || lowerTitle.includes('utilisateur')) {
      return FiUsers;
    }
    if (lowerTitle.includes('produit')) {
      return FiPackage;
    }
    return FiBarChart2;
  };

  return (
    <div className="stats-container">
      {/* Header */}
      <div className="stats-header">
        <div className="stats-header-left">
          <h1 className="stats-title">
            <FiBarChart2 />
            Statistiques IA
          </h1>
          <p className="stats-subtitle">
            Analysez vos données en langage naturel
          </p>
        </div>
        {charts.length > 0 && (
          <button className="stats-clear-btn" onClick={handleClearCharts}>
            <FiTrash2 />
            Effacer les graphiques
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="stats-content">
        {/* Charts Zone */}
        <div className="stats-charts-zone">
          {charts.length === 0 ? (
            <div className="stats-charts-empty">
              <FiPieChart size={64} />
              <h3>Aucun graphique</h3>
              <p>Demandez un graphique dans le chat pour le voir apparaître ici</p>
              <div className="stats-example-queries">
                <span>Essayez :</span>
                <button onClick={() => handleSendMessage("Montre les ventes par catégorie en camembert")}>
                  Ventes par catégorie
                </button>
                <button onClick={() => handleSendMessage("Top 10 produits les plus vendus en barres")}>
                  Top produits
                </button>
              </div>
            </div>
          ) : (
            <div className="stats-charts-grid">
              {charts.map(chart => (
                <ChartCard 
                  key={chart.id} 
                  chart={chart} 
                  onRemove={handleRemoveChart} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Chat Zone */}
        <div className="stats-chat-zone">
          {/* Chat Header */}
          <div className="stats-chat-header">
            <div className="stats-chat-header-info">
              <div className="stats-chat-avatar">
                <FiCpu />
              </div>
              <div>
                <h3>Assistant Analytique</h3>
                <span className="stats-chat-status">
                  {isLoading ? "En train d'analyser..." : 'Prêt'}
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="stats-chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`stats-chat-message ${message.type} ${message.isError ? 'error' : ''}`}
              >
                <div className="stats-chat-message-avatar">
                  {message.type === 'user' ? <FiUser /> : <FiCpu />}
                </div>
                <div className="stats-chat-message-content">
                  <div className="stats-chat-message-bubble">
                    <p>{message.content}</p>
                    {message.kpiData && (
                      <KPICard 
                        title={message.kpiData.title}
                        value={message.kpiData.value}
                        formatted={message.kpiData.formatted}
                        icon={getKpiIcon(message.kpiData.title)}
                        description={message.kpiData.description}
                      />
                    )}
                  </div>
                  <span className="stats-chat-message-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="stats-chat-message bot">
                <div className="stats-chat-message-avatar">
                  <FiCpu />
                </div>
                <div className="stats-chat-message-content">
                  <div className="stats-chat-message-bubble">
                    <div className="stats-chat-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="stats-chat-suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="stats-chat-suggestion-btn"
                  onClick={() => handleSendMessage(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="stats-chat-input-area">
            <div className="stats-chat-input-container">
              <input
                ref={inputRef}
                type="text"
                placeholder="Posez une question sur vos données..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="stats-chat-send-btn"
              >
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatistiquesChat;
