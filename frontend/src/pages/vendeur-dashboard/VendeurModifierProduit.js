import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import vendeurProduitService from '../../services/vendeurProduitService';
import { BACKEND_URL } from '../../config/apiConfig';
import './VendeurDashboard.css';

const VendeurModifierProduit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    prixVendeur: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProduit();
  }, [id]);

  const fetchProduit = async () => {
    try {
      setLoading(true);
      const data = await vendeurProduitService.getMonProduit(id);
      setProduit(data);
      setFormData({
        titre: data.titre || '',
        description: data.description || '',
        prixVendeur: data.prixVendeur || ''
      });
      if (data.image) {
        setImagePreview(getImageUrl(data.image));
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Produit non trouvé ou vous n\'êtes pas autorisé à le modifier');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  const formatPrice = (prix) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(prix);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 5 Mo');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    const prixVendeur = parseFloat(formData.prixVendeur);
    if (isNaN(prixVendeur) || prixVendeur <= produit.prixOriginal) {
      setError(`Le prix vendeur doit être supérieur au prix original (${formatPrice(produit.prixOriginal)})`);
      return;
    }

    if (!formData.titre.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    setSubmitting(true);
    try {
      let response;
      if (imageFile) {
        // Avec nouvelle image
        response = await vendeurProduitService.modifierProduit(
          id,
          formData.titre,
          prixVendeur,
          formData.description,
          imageFile
        );
      } else {
        // Sans nouvelle image
        response = await vendeurProduitService.modifierProduitJson(
          id,
          formData.titre,
          prixVendeur,
          formData.description,
          produit.image
        );
      }

      if (response.success) {
        setSuccess(response.message);
        setTimeout(() => {
          navigate('/vendeur/dashboard/mes-produits');
        }, 2000);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="vendeur-content">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!produit) {
    return (
      <div className="vendeur-content">
        <div className="error-state">
          <h3>Produit non trouvé</h3>
          <button onClick={() => navigate('/vendeur/dashboard/mes-produits')} className="btn-secondary">
            Retour à mes produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vendeur-content">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/vendeur/dashboard/mes-produits')}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path>
          </svg>
          Retour
        </button>
        <h2>Modifier mon produit</h2>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
          </svg>
          {error}
          <button className="alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
          </svg>
          {success}
        </div>
      )}

      <div className="edit-product-container">
        <div className="product-info-card">
          <h3>Produit original</h3>
          <div className="original-product-info">
            <p><strong>Nom:</strong> {produit.produitNom}</p>
            <p><strong>Catégorie:</strong> {produit.categorieNom || 'Non catégorisé'}</p>
            <p><strong>Prix original:</strong> {formatPrice(produit.prixOriginal)}</p>
          </div>
          <div className="info-box warning">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
            </svg>
            <p>Après modification, votre produit sera remis en attente d'approbation par l'administrateur.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="edit-product-form">
          <div className="image-upload-section">
            <label>Image du produit</label>
            <div className="image-upload-area" onClick={handleImageClick}>
              {imagePreview ? (
                <img src={imagePreview} alt="Aperçu" className="image-preview" />
              ) : (
                <div className="image-placeholder">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path>
                  </svg>
                  <span>Cliquez pour changer l'image</span>
                </div>
              )}
              <div className="image-overlay">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                </svg>
                <span>Modifier</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <small className="form-help">Format: JPG, PNG. Max: 5 Mo</small>
          </div>

          <div className="form-group">
            <label htmlFor="titre">Titre de votre offre *</label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex: Offre spéciale - Livraison gratuite"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="prixVendeur">Votre prix de vente (DH) *</label>
            <input
              type="number"
              id="prixVendeur"
              name="prixVendeur"
              value={formData.prixVendeur}
              onChange={handleChange}
              placeholder={`Minimum: ${(parseFloat(produit.prixOriginal) + 0.01).toFixed(2)}`}
              step="0.01"
              min={parseFloat(produit.prixOriginal) + 0.01}
              required
            />
            <small className="form-help">
              Doit être supérieur au prix original ({formatPrice(produit.prixOriginal)}). 
              Marge actuelle: {formatPrice(formData.prixVendeur - produit.prixOriginal)}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description de votre offre</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez les avantages de votre offre..."
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/vendeur/dashboard/mes-produits')}
            >
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-small"></span>
                  Modification en cours...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendeurModifierProduit;
