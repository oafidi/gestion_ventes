import React, { useState, useEffect, useRef } from 'react';
import produitService from '../../services/produitService';
import categorieService from '../../services/categorieService';
import './Produits.css';

const API_BASE_URL = 'http://localhost:8080';

const Produits = () => {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduit, setEditingProduit] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    quantite: '',
    categorieId: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');
  const fileInputRef = useRef(null);

  // Charger les produits et les catégories
  const fetchData = async () => {
    try {
      setLoading(true);
      const [produitsData, categoriesData] = await Promise.all([
        produitService.getAllProduits(),
        categorieService.getAllCategories()
      ]);
      setProduits(produitsData);
      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Ouvrir le modal pour ajouter
  const handleAdd = () => {
    setEditingProduit(null);
    setFormData({
      nom: '',
      description: '',
      prix: '',
      quantite: '',
      categorieId: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  // Ouvrir le modal pour modifier
  const handleEdit = (produit) => {
    setEditingProduit(produit);
    setFormData({
      nom: produit.nom,
      description: produit.description || '',
      prix: produit.prix,
      quantite: produit.quantite,
      categorieId: produit.categorie?.id || ''
    });
    setImageFile(null);
    setImagePreview(produit.image ? `${API_BASE_URL}${produit.image}` : null);
    setShowModal(true);
  };

  // Gérer la sélection d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Supprimer l'image sélectionnée
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Supprimer un produit
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await produitService.deleteProduit(id);
        fetchData();
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduit) {
        await produitService.updateProduit(
          editingProduit.id,
          formData.nom,
          formData.description,
          formData.prix,
          formData.quantite,
          formData.categorieId || null,
          imageFile
        );
      } else {
        await produitService.createProduit(
          formData.nom,
          formData.description,
          formData.prix,
          formData.quantite,
          formData.categorieId || null,
          imageFile
        );
      }
      setShowModal(false);
      setImageFile(null);
      setImagePreview(null);
      setError(null);
      fetchData();
    } catch (err) {
      console.error('Erreur:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde';
      setError(errorMessage);
    }
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowModal(false);
    setImageFile(null);
    setImagePreview(null);
  };

  // Filtrer les produits
  const filteredProduits = produits.filter(produit => {
    const matchesSearch = produit.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategorie = !filterCategorie || produit.categorie?.id?.toString() === filterCategorie;
    return matchesSearch && matchesCategorie;
  });

  // Obtenir l'URL complète de l'image
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  // Formater le prix
  const formatPrice = (prix) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(prix);
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h2>Gestion des Produits</h2>
        <button className="btn-primary" onClick={handleAdd}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
          </svg>
          Ajouter un produit
        </button>
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

      <div className="produits-toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
            </svg>
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={filterCategorie}
            onChange={(e) => setFilterCategorie(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nom}</option>
            ))}
          </select>
        </div>
        <div className="produits-count">
          {filteredProduits.length} produit(s)
        </div>
      </div>

      <div className="produits-table-container">
        {filteredProduits.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path>
            </svg>
            <h3>Aucun produit trouvé</h3>
            <p>Commencez par ajouter un nouveau produit</p>
          </div>
        ) : (
          <table className="produits-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Quantité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProduits.map(produit => (
                <tr key={produit.id}>
                  <td>
                    <div className="produit-image-cell">
                      {produit.image ? (
                        <img src={getImageUrl(produit.image)} alt={produit.nom} />
                      ) : (
                        <div className="produit-no-image">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="produit-info">
                      <span className="produit-nom">{produit.nom}</span>
                      {produit.description && (
                        <span className="produit-description">{produit.description.substring(0, 50)}...</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="categorie-badge">
                      {produit.categorie?.nom || 'Non classé'}
                    </span>
                  </td>
                  <td className="prix-cell">{formatPrice(produit.prix)}</td>
                  <td>
                    <span className={`stock-badge ${produit.quantite > 10 ? 'in-stock' : produit.quantite > 0 ? 'low-stock' : 'out-of-stock'}`}>
                      {produit.quantite}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEdit(produit)}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                        </svg>
                        <span>Modifier</span>
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(produit.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                        </svg>
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduit ? 'Modifier le produit' : 'Nouveau produit'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nom">Nom du produit *</label>
                  <input
                    type="text"
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Entrez le nom du produit"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="categorieId">Catégorie</label>
                  <select
                    id="categorieId"
                    value={formData.categorieId}
                    onChange={(e) => setFormData({ ...formData, categorieId: e.target.value })}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du produit..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="prix">Prix (€) *</label>
                  <input
                    type="number"
                    id="prix"
                    value={formData.prix}
                    onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="quantite">Quantité en stock *</label>
                  <input
                    type="number"
                    id="quantite"
                    value={formData.quantite}
                    onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image du produit</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="image"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  <label htmlFor="image" className="file-upload-label">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"></path>
                    </svg>
                    <span>Choisir une image</span>
                  </label>
                </div>
              </div>

              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Aperçu" />
                  <button type="button" className="remove-image-btn" onClick={handleRemoveImage}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                    </svg>
                  </button>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduit ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Produits;
