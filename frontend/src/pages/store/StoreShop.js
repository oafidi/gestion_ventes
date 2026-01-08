import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { StoreHeader, StoreFooter, CartSidebar } from './StoreHome';
import storeService from '../../services/storeService';
import { getImageUrl } from '../../config/apiConfig';
import { FiShoppingCart, FiShoppingBag, FiTag, FiInbox, FiCheck, FiX } from 'react-icons/fi';
import '../../styles/Store.css';

// Composant ProductCard réutilisable
const ProductCard = ({ product, getImageUrl, handleAddToCart }) => (
  <div className="store-product-card">
    <Link to={`/store/product/${product.id}`}>
      <div className="store-product-image-container">
        {product.image ? (
          <img 
            src={getImageUrl(product.image)} 
            alt={product.titre || product.produitNom}
            className="store-product-image"
          />
        ) : (
          <div className="store-product-placeholder"><FiShoppingBag size={60} /></div>
        )}
      </div>
    </Link>
    <div className="store-product-info">
      <span className="store-product-category">
        {product.categorieNom || 'Catégorie'}
      </span>
      <Link to={`/store/product/${product.id}`} className="store-product-title">
        {product.titre || product.produitNom}
      </Link>
      {product.description && (
        <p className="store-product-description">
          {product.description.length > 60 
            ? product.description.substring(0, 60) + '...' 
            : product.description}
        </p>
      )}
      <div className="store-product-vendor">
        Vendu par <strong>{product.vendeurNom || 'Vendeur'}</strong>
      </div>
      <div style={{ 
        fontSize: '11px', 
        marginTop: '4px',
        color: (product.quantiteStock || 0) > 0 ? '#155724' : '#721c24',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {(product.quantiteStock || 0) > 0 ? (
          <><FiCheck size={12} /> En stock</>
        ) : (
          <><FiX size={12} /> Épuisé</>
        )}
      </div>
      <div className="store-product-price-row">
        <span className="store-product-price">
          {parseFloat(product.prixVendeur).toFixed(2)} DH
        </span>
        <button 
          className="store-add-to-cart-btn"
          onClick={(e) => handleAddToCart(product, e)}
          title={(product.quantiteStock || 0) > 0 ? "Ajouter au panier" : "Épuisé"}
          disabled={(product.quantiteStock || 0) <= 0}
          style={(product.quantiteStock || 0) <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <FiShoppingCart />
        </button>
      </div>
    </div>
  </div>
);

const StoreShop = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, getCartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSemanticResults, setShowSemanticResults] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categoryParam !== 'all') {
      setSelectedCategory(parseInt(categoryParam));
    } else {
      setSelectedCategory(null);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData] = await Promise.all([
        storeService.getAllCategories(),
        storeService.getProduitsApprouves()
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    if ((product.quantiteStock || 0) <= 0) return;
    addToCart({
      id: product.id,
      titre: product.titre || product.produitNom,
      prixVendeur: product.prixVendeur,
      image: product.image,
      vendeurNom: product.vendeurNom,
      description: product.description,
      quantiteStock: product.quantiteStock || 0
    });
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  // Recherche sémantique avec l'AI
  const handleSemanticSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setShowSemanticResults(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await storeService.rechercheSemantiqueComplete(query);
      setSearchResults(results);
      setShowSemanticResults(true);
    } catch (error) {
      console.error('Erreur recherche sémantique:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce pour la recherche sémantique
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        handleSemanticSearch(searchTerm);
      } else {
        setShowSemanticResults(false);
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
    setShowSemanticResults(false);
    setSearchResults([]);
  };

  // Recherche par image avec l'AI
  const handleImageSearch = async (imageUrl) => {
    if (!imageUrl || !imageUrl.trim()) return;

    setIsSearching(true);
    try {
      const aiResponse = await storeService.rechercheSemantiqueImage(imageUrl);
      const productIds = aiResponse.ids || [];

      if (productIds.length === 0) {
        setSearchResults([]);
        setShowSemanticResults(true);
        return;
      }

      const allProducts = await storeService.getProduitsApprouves();
      const foundProducts = allProducts.filter(product =>
        productIds.includes(String(product.id))
      );

      foundProducts.sort((a, b) => {
        return productIds.indexOf(String(a.id)) - productIds.indexOf(String(b.id));
      });

      setSearchResults(foundProducts);
      setShowSemanticResults(true);
    } catch (error) {
      console.error('Erreur recherche par image:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const title = product.titre || product.produitNom || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    // Check both categorieId and match by categorieNom as fallback
    let matchesCategory = !selectedCategory;
    if (selectedCategory) {
      const selectedCat = categories.find(c => c.id === selectedCategory);
      if (selectedCat) {
        matchesCategory = product.categorieId === selectedCategory || 
                         product.categorieNom === selectedCat.nom;
      }
    }
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="store-container">
        <StoreHeader 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          cartCount={getCartCount()}
          onCartClick={() => setCartOpen(true)}
          isSearching={isSearching}
          onClearSearch={clearSearch}
          onImageSearch={handleImageSearch}
        />
        <div className="store-loading">
          <div className="store-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="store-container">
      <StoreHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        cartCount={getCartCount()}
        onCartClick={() => setCartOpen(true)}
        isSearching={isSearching}
        onClearSearch={clearSearch}
        onImageSearch={handleImageSearch}
      />

      <div className="store-wrapper">
        {/* Breadcrumb */}
        <div className="store-breadcrumb" style={{ padding: '20px 0' }}>
          <Link to="/store">Accueil</Link>
          <span>/</span>
          <span style={{ color: 'var(--store-gray-700)' }}>Boutique</span>
          {selectedCategory && (
            <>
              <span>/</span>
              <span style={{ color: 'var(--store-gray-700)' }}>
                {categories.find(c => c.id === selectedCategory)?.nom}
              </span>
            </>
          )}
        </div>

        <div className="store-shop-layout">
          {/* Filters Sidebar */}
          <aside className="store-filters">
            <h3><FiTag style={{ marginRight: '8px' }} /> Catégories</h3>
            <div
              className={`store-filter-category ${!selectedCategory ? 'active' : ''}`}
              onClick={() => handleCategorySelect(null)}
            >
              Toutes les catégories
            </div>
            {categories.map(category => (
              <div
                key={category.id}
                className={`store-filter-category ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategorySelect(category.id)}
              >
                {category.nom}
              </div>
            ))}
          </aside>

          {/* Products Grid */}
          <div>
            <div className="store-section-title">
              <span>
                <FiShoppingBag className="store-section-title-icon" />
                {showSemanticResults 
                  ? 'Résultats de recherche'
                  : selectedCategory 
                    ? categories.find(c => c.id === selectedCategory)?.nom 
                    : 'Tous les produits'
                }
                <span style={{ fontWeight: 400, fontSize: '14px', color: 'var(--store-gray-500)', marginLeft: '15px' }}>
                  ({(showSemanticResults ? searchResults : filteredProducts).length} produits)
                </span>
              </span>
              {showSemanticResults && (
                <button 
                  onClick={clearSearch} 
                  style={{ 
                    cursor: 'pointer', 
                    border: 'none', 
                    background: 'rgba(255, 107, 53, 0.1)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    color: 'var(--store-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <FiX /> Effacer
                </button>
              )}
            </div>

            {(showSemanticResults ? searchResults : filteredProducts).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--store-gray-500)' }}>
                <div style={{ marginBottom: '20px' }}><FiInbox size={60} /></div>
                <p>Aucun produit trouvé</p>
              </div>
            ) : (
              <div className="store-products-grid">
                {(showSemanticResults ? searchResults : filteredProducts).map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    getImageUrl={getImageUrl} 
                    handleAddToCart={handleAddToCart} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <StoreFooter />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default StoreShop;
