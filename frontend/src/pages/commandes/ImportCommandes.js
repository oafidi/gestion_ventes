import React, { useState, useRef } from 'react';
import { FiUpload, FiDownload, FiFile, FiX, FiCheck, FiAlertCircle, FiAlertTriangle, FiDatabase, FiLoader, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import api from '../../services/api';
import { BACKEND_URL } from '../../config/apiConfig';
import './Commandes.css';

const ImportCommandes = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [validatedData, setValidatedData] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setValidatedData(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.CSV'))) {
      setFile(droppedFile);
      setResult(null);
      setValidatedData(null);
    } else {
      setResult({
        success: false,
        message: 'Veuillez deposer un fichier CSV'
      });
    }
  };

  const handleValidate = async () => {
    if (!file) return;

    setValidating(true);
    setResult(null);
    setValidatedData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/admin/commandes/valider-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
      if (response.data.success) {
        setValidatedData(file);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la validation',
        erreurs: error.response?.data?.erreurs || []
      });
    } finally {
      setValidating(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!validatedData) return;

    setSaving(true);

    const formData = new FormData();
    formData.append('file', validatedData);

    try {
      const response = await api.post('/admin/commandes/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
      if (response.data.success) {
        setFile(null);
        setValidatedData(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la sauvegarde',
        erreurs: error.response?.data?.erreurs || []
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadExample = () => {
    window.open(`${BACKEND_URL}/api/admin/commandes/exemple-csv`, '_blank');
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setValidatedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="import-container">
      {/* Header */}
      <div className="import-page-header">
        <div className="import-title-section">
          <h1>Import des Commandes</h1>
          <p>Importez vos commandes en masse via un fichier CSV avec validation automatique</p>
        </div>
        <button className="btn-example" onClick={handleDownloadExample}>
          <FiDownload />
          Telecharger exemple CSV
        </button>
      </div>

      {/* Main Content */}
      <div className="import-content">
        {/* Left Panel - Upload */}
        <div className="import-panel upload-panel">
          <div className="panel-header">
            <FiUpload className="panel-icon" />
            <h2>Charger le fichier</h2>
          </div>
          
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {file ? (
              <div className="file-selected">
                <div className="file-icon-wrapper">
                  <FiFile className="file-icon" />
                </div>
                <div className="file-details">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
                <button className="btn-remove" onClick={(e) => { e.stopPropagation(); resetForm(); }}>
                  <FiX />
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon-wrapper">
                  <FiUpload className="upload-icon" />
                </div>
                <p className="upload-text">Glissez-deposez un fichier CSV</p>
                <span className="upload-divider">ou</span>
                <span className="btn-browse">Parcourir les fichiers</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {file && (
            <div className="action-buttons">
              <button
                className="btn-action btn-validate"
                onClick={handleValidate}
                disabled={validating || saving}
              >
                {validating ? (
                  <><FiLoader className="spinning" /> Validation...</>
                ) : (
                  <><FiCheck /> Valider le fichier</>
                )}
              </button>
              
              <button
                className="btn-action btn-save"
                onClick={handleSaveToDatabase}
                disabled={!validatedData || saving || validating}
              >
                {saving ? (
                  <><FiLoader className="spinning" /> Sauvegarde...</>
                ) : (
                  <><FiDatabase /> Sauvegarder en base</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Instructions */}
        <div className="import-panel info-panel">
          <div className="panel-header">
            <FiInfo className="panel-icon" />
            <h2>Format du fichier</h2>
          </div>
          
          <div className="format-info">
            <p className="format-description">Le fichier CSV doit contenir les colonnes suivantes :</p>
            
            <div className="columns-list">
              <div className="column-item">
                <code>commande_ref</code>
                <span>Reference unique de la commande</span>
              </div>
              <div className="column-item">
                <code>client_id</code>
                <span>ID du client</span>
              </div>
              <div className="column-item">
                <code>date_commande</code>
                <span>Format: YYYY-MM-DD HH:mm:ss</span>
              </div>
              <div className="column-item">
                <code>statut</code>
                <span>EN_ATTENTE, CONFIRMEE, LIVREE...</span>
              </div>
              <div className="column-item">
                <code>vendeur_produit_id</code>
                <span>ID du produit vendeur</span>
              </div>
              <div className="column-item">
                <code>quantite</code>
                <span>Quantite commandee</span>
              </div>
              <div className="column-item">
                <code>prix_unitaire</code>
                <span>Prix unitaire (ex: 150.00)</span>
              </div>
            </div>

            <div className="format-notes">
              <div className="note-item">
                <FiCheckCircle className="note-icon success" />
                <span>Separateurs supportes: virgule (,) ou point-virgule (;)</span>
              </div>
              <div className="note-item">
                <FiCheckCircle className="note-icon success" />
                <span>Les doublons sont automatiquement detectes</span>
              </div>
              <div className="note-item">
                <FiCheckCircle className="note-icon success" />
                <span>Les erreurs mineures sont corrigees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className={`result-section ${result.success ? 'success' : 'error'}`}>
          <div className="result-header">
            {result.success ? (
              <FiCheckCircle className="result-icon success" />
            ) : (
              <FiXCircle className="result-icon error" />
            )}
            <div className="result-title">
              <h3>{result.success ? 'Operation reussie' : 'Erreur detectee'}</h3>
              <p>{result.message}</p>
            </div>
          </div>

          {/* Statistics Grid */}
          {(result.totalLignes > 0 || result.commandesImportees > 0) && (
            <div className="stats-grid">
              {result.totalLignes > 0 && (
                <div className="stat-card">
                  <span className="stat-number">{result.totalLignes}</span>
                  <span className="stat-label">Lignes traitees</span>
                </div>
              )}
              {result.commandesImportees > 0 && (
                <div className="stat-card success">
                  <span className="stat-number">{result.commandesImportees}</span>
                  <span className="stat-label">Commandes importees</span>
                </div>
              )}
              {result.lignesCommandeImportees > 0 && (
                <div className="stat-card success">
                  <span className="stat-number">{result.lignesCommandeImportees}</span>
                  <span className="stat-label">Lignes de commande</span>
                </div>
              )}
              {result.doublonsIgnores > 0 && (
                <div className="stat-card warning">
                  <span className="stat-number">{result.doublonsIgnores}</span>
                  <span className="stat-label">Doublons ignores</span>
                </div>
              )}
              {result.erreursCorrigees > 0 && (
                <div className="stat-card info">
                  <span className="stat-number">{result.erreursCorrigees}</span>
                  <span className="stat-label">Erreurs corrigees</span>
                </div>
              )}
            </div>
          )}

          {/* Imported Orders Table */}
          {result.commandesDetails && result.commandesDetails.length > 0 && (
            <div className="orders-table-section">
              <h4>Commandes importees</h4>
              <div className="table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Client</th>
                      <th>Lignes</th>
                      <th>Montant</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.commandesDetails.map((cmd, index) => (
                      <tr key={index}>
                        <td><strong>#{cmd.commandeId}</strong></td>
                        <td>{cmd.clientEmail}</td>
                        <td>{cmd.nbLignes}</td>
                        <td className="amount">{cmd.montantTotal}</td>
                        <td>
                          <span className={`status-badge ${cmd.statut.toLowerCase()}`}>
                            {cmd.statut.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Errors List */}
          {result.erreurs && result.erreurs.length > 0 && (
            <div className="errors-section">
              <div className="section-header">
                <FiXCircle className="section-icon error" />
                <h4>Erreurs ({result.erreurs.length})</h4>
              </div>
              <ul className="error-list">
                {result.erreurs.slice(0, 10).map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
                {result.erreurs.length > 10 && (
                  <li className="more-items">... et {result.erreurs.length - 10} autres erreurs</li>
                )}
              </ul>
            </div>
          )}

          {/* Warnings List */}
          {result.avertissements && result.avertissements.length > 0 && (
            <div className="warnings-section">
              <div className="section-header">
                <FiAlertTriangle className="section-icon warning" />
                <h4>Avertissements ({result.avertissements.length})</h4>
              </div>
              <ul className="warning-list">
                {result.avertissements.slice(0, 10).map((warn, index) => (
                  <li key={index}>{warn}</li>
                ))}
                {result.avertissements.length > 10 && (
                  <li className="more-items">... et {result.avertissements.length - 10} autres avertissements</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportCommandes;
