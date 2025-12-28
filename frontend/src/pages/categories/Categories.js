import React, { useState, useEffect, useRef } from 'react';
import categorieService from '../../services/categorieService';
import './Categories.css';

const API_BASE_URL = 'http://localhost:8080';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState(null);
  const [formData, setFormData] = useState({ nom: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  // Charger les catégories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categorieService.getAllCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des catégories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Ouvrir le modal pour ajouter
  const handleAdd = () => {
    setEditingCategorie(null);
    setFormData({ nom: '' });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  // Ouvrir le modal pour modifier
  const handleEdit = (categorie) => {
    setEditingCategorie(categorie);
    setFormData({ nom: categorie.nom });
    setImageFile(null);
    setImagePreview(categorie.image ? `${API_BASE_URL}${categorie.image}` : null);
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

  // Supprimer une catégorie
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        await categorieService.deleteCategorie(id);
        fetchCategories();
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
      if (editingCategorie) {
        await categorieService.updateCategorie(editingCategorie.id, formData.nom, imageFile);
      } else {
        await categorieService.createCategorie(formData.nom, imageFile);
      }
      setShowModal(false);
      setImageFile(null);
      setImagePreview(null);
      setError(null);
      fetchCategories();
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

  // Filtrer les catégories
  const filteredCategories = categories.filter(cat =>
    cat.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir l'URL complète de l'image
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h2>Gestion des Catégories</h2>
        <button className="btn-primary" onClick={handleAdd}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
          </svg>
          Ajouter une catégorie
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

      <div className="categories-toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
          </svg>
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="categories-count">
          {filteredCategories.length} catégorie(s)
        </div>
      </div>

      <div className="categories-grid">
        {filteredCategories.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path>
            </svg>
            <h3>Aucune catégorie trouvée</h3>
            <p>Commencez par ajouter une nouvelle catégorie</p>
          </div>
        ) : (
          filteredCategories.map(categorie => (
            <div key={categorie.id} className="category-card">
              <div className="category-image">
                {categorie.image ? (
                  <img src={getImageUrl(categorie.image)} alt={categorie.nom} />
                ) : (
                  <div className="category-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className="category-content">
                <h3>{categorie.nom}</h3>
              </div>
              <div className="category-actions">
                <button 
                  className="btn-action btn-edit" 
                  onClick={() => handleEdit(categorie)}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                  </svg>
                  <span>Modifier</span>
                </button>
                <button 
                  className="btn-action btn-delete" 
                  onClick={() => handleDelete(categorie.id)}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                  </svg>
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Ajout/Modification */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nom">Nom de la catégorie</label>
                <input
                  type="text"
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Entrez le nom de la catégorie"
                  required
                />
              </div>
              <div className="form-group">
                <label>Image de la catégorie (optionnel)</label>
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
                  {editingCategorie ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
