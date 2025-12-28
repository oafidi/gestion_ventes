import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { StoreHeader, StoreFooter, CartSidebar } from './StoreHome';
import storeService from '../../services/storeService';
import { 
  FiShoppingCart, 
  FiShoppingBag, 
  FiMinus, 
  FiPlus, 
  FiTruck, 
  FiRefreshCw, 
  FiShield,
  FiZap,
  FiGrid,
  FiStar,
  FiUser,
  FiSend,
  FiCheck,
  FiX,
  FiThumbsUp,
  FiThumbsDown
} from 'react-icons/fi';
import '../../styles/Store.css';

const StoreProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart, getCartCount, getRemainingStock, cartItems } = useCart();

  // États pour les avis
  const [avis, setAvis] = useState([]);
  const [statsAvis, setStatsAvis] = useState({ moyenne: 0, nombreAvis: 0 });
  const [newAvis, setNewAvis] = useState({ note: 5, commentaire: '' });
  const [avisLoading, setAvisLoading] = useState(false);
  const [avisMessage, setAvisMessage] = useState({ type: '', text: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Calculer le stock restant disponible
  const getAvailableStock = () => {
    if (!product) return 0;
    const cartItem = cartItems.find(item => item.id === product.id);
    const stockTotal = product.quantiteStock || 0;
    const quantiteDansPanier = cartItem ? cartItem.quantity : 0;
    return stockTotal - quantiteDansPanier;
  };

  const availableStock = getAvailableStock();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!(user && token));
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchAvis();
    }
  }, [product]);

  const fetchAvis = async () => {
    try {
      const [avisData, statsData] = await Promise.all([
        storeService.getAvisProduit(product.id),
        storeService.getStatsAvis(product.id)
      ]);
      setAvis(avisData);
      setStatsAvis(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
    }
  };

  const handleSubmitAvis = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/store/login');
      return;
    }

    setAvisLoading(true);
    setAvisMessage({ type: '', text: '' });

    try {
      const response = await storeService.ajouterAvis({
        vendeurProduitId: product.id,
        note: newAvis.note,
        commentaire: newAvis.commentaire
      });

      if (response.success) {
        setAvisMessage({ type: 'success', text: 'Votre avis a été ajouté avec succès !' });
        setNewAvis({ note: 5, commentaire: '' });
        fetchAvis();
      } else {
        setAvisMessage({ type: 'error', text: response.message });
      }
    } catch (error) {
      setAvisMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de l\'ajout de l\'avis' 
      });
    } finally {
      setAvisLoading(false);
    }
  };

  const renderStars = (note, interactive = false, onSelect = null) => {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            size={interactive ? 28 : 16}
            fill={star <= note ? '#ffc107' : 'none'}
            color={star <= note ? '#ffc107' : '#ddd'}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            onClick={() => interactive && onSelect && onSelect(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Try to get product from list (as API might not have individual endpoint)
      const products = await storeService.getProduitsApprouves();
      const foundProduct = products.find(p => p.id === parseInt(id));
      
      if (foundProduct) {
        setProduct(foundProduct);
        // Get related products from same category
        const related = products.filter(
          p => p.categorieId === foundProduct.categorieId && p.id !== foundProduct.id
        ).slice(0, 4);
        setRelatedProducts(related);
      } else {
        navigate('/store/shop');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
      navigate('/store/shop');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (availableStock <= 0) return;
    addToCart({
      id: product.id,
      titre: product.titre || product.produitNom,
      prixVendeur: product.prixVendeur,
      image: product.image,
      vendeurNom: product.vendeurNom,
      quantiteStock: product.quantiteStock || 0
    }, Math.min(quantity, availableStock));
    setCartOpen(true);
    setQuantity(1); // Reset quantity after adding
  };

  const handleBuyNow = () => {
    if (availableStock <= 0) return;
    addToCart({
      id: product.id,
      titre: product.titre || product.produitNom,
      prixVendeur: product.prixVendeur,
      image: product.image,
      vendeurNom: product.vendeurNom,
      quantiteStock: product.quantiteStock || 0
    }, Math.min(quantity, availableStock));
    navigate('/store/checkout');
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8080${imagePath}`;
  };

  if (loading) {
    return (
      <div className="store-container">
        <StoreHeader 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          cartCount={getCartCount()}
          onCartClick={() => setCartOpen(true)}
        />
        <div className="store-loading">
          <div className="store-spinner"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="store-container">
      <StoreHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        cartCount={getCartCount()}
        onCartClick={() => setCartOpen(true)}
      />

      <div className="store-wrapper">
        {/* Breadcrumb */}
        <div className="store-breadcrumb" style={{ padding: '20px 0' }}>
          <Link to="/store">Accueil</Link>
          <span>/</span>
          <Link to="/store/shop">Boutique</Link>
          <span>/</span>
          <span style={{ color: 'var(--store-gray-700)' }}>
            {product.titre || product.produitNom}
          </span>
        </div>

        {/* Product Detail */}
        <div className="store-product-detail">
          <div className="store-product-detail-grid">
            {/* Product Image */}
            <div className="store-product-detail-image">
              {product.image ? (
                <img 
                  src={getImageUrl(product.image)} 
                  alt={product.titre || product.produitNom}
                />
              ) : (
                <div style={{ 
                  height: '500px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--store-gray-300)'
                }}>
                  <FiShoppingBag size={120} />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="store-product-detail-info">
              <span className="store-product-category" style={{ marginBottom: '10px', display: 'block' }}>
                {product.categorieNom || 'Catégorie'}
              </span>
              <h1>{product.titre || product.produitNom}</h1>
              <div className="store-product-detail-vendor">
                Vendu par <strong>{product.vendeurNom || 'Vendeur'}</strong>
              </div>
              <div className="store-product-detail-price">
                {parseFloat(product.prixVendeur).toFixed(2)} DH
              </div>

              {/* Stock indicator */}
              <div style={{ 
                marginTop: '10px', 
                padding: '8px 12px', 
                borderRadius: 'var(--store-radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: availableStock > 0 ? '#d4edda' : '#f8d7da',
                color: availableStock > 0 ? '#155724' : '#721c24'
              }}>
                {availableStock > 0 ? (
                  <><FiCheck size={14} /> En stock</>
                ) : (
                  <><FiX size={14} /> Épuisé</>
                )}
              </div>

              {product.description && (
                <div className="store-product-detail-description">
                  {product.description}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="store-quantity-selector">
                <label>Quantité:</label>
                <div className="store-quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || availableStock <= 0}
                  >
                    <FiMinus />
                  </button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(Math.max(1, val), availableStock || 1));
                    }}
                    min="1"
                    max={availableStock || 1}
                    disabled={availableStock <= 0}
                  />
                  <button 
                    onClick={() => setQuantity(Math.min(quantity + 1, availableStock))}
                    disabled={quantity >= availableStock || availableStock <= 0}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="store-product-detail-actions">
                <button 
                  className="store-btn-primary"
                  onClick={handleAddToCart}
                  disabled={availableStock <= 0}
                  style={availableStock <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  <FiShoppingCart style={{ marginRight: '8px' }} /> 
                  {availableStock <= 0 ? 'Épuisé' : 'Ajouter au panier'}
                </button>
                <button 
                  className="store-btn-secondary"
                  onClick={handleBuyNow}
                  disabled={availableStock <= 0}
                  style={availableStock <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  <FiZap style={{ marginRight: '8px' }} /> Acheter maintenant
                </button>
              </div>

              {/* Extra Info */}
              <div style={{ marginTop: '30px', padding: '20px', background: 'var(--store-gray-100)', borderRadius: 'var(--store-radius-sm)' }}>
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiTruck />
                  <span>Livraison gratuite à partir de 500 DH</span>
                </div>
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiRefreshCw />
                  <span>Retours gratuits sous 14 jours</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiShield />
                  <span>Paiement 100% sécurisé</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="store-section" style={{ marginTop: '40px' }}>
            <div className="store-section-title">
              <span>
                <FiGrid className="store-section-title-icon" />
                Produits similaires
              </span>
            </div>
            <div className="store-products-grid">
              {relatedProducts.map(relProduct => (
                <div key={relProduct.id} className="store-product-card">
                  <Link to={`/store/product/${relProduct.id}`}>
                    <div className="store-product-image-container">
                      {relProduct.image ? (
                        <img 
                          src={getImageUrl(relProduct.image)} 
                          alt={relProduct.titre || relProduct.produitNom}
                          className="store-product-image"
                        />
                      ) : (
                        <div className="store-product-placeholder"><FiShoppingBag size={60} /></div>
                      )}
                    </div>
                  </Link>
                  <div className="store-product-info">
                    <span className="store-product-category">
                      {relProduct.categorieNom || 'Catégorie'}
                    </span>
                    <Link to={`/store/product/${relProduct.id}`} className="store-product-title">
                      {relProduct.titre || relProduct.produitNom}
                    </Link>
                    <div className="store-product-vendor">
                      Vendu par <strong>{relProduct.vendeurNom || 'Vendeur'}</strong>
                    </div>
                    <div className="store-product-price-row">
                      <span className="store-product-price">
                        {parseFloat(relProduct.prixVendeur).toFixed(2)} DH
                      </span>
                      <button 
                        className="store-add-to-cart-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart({
                            id: relProduct.id,
                            titre: relProduct.titre || relProduct.produitNom,
                            prixVendeur: relProduct.prixVendeur,
                            image: relProduct.image,
                            vendeurNom: relProduct.vendeurNom
                          });
                        }}
                        title="Ajouter au panier"
                      >
                        <FiShoppingCart />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section Avis */}
        <section className="store-section" style={{ marginTop: '50px' }}>
          <div className="store-section-title">
            <span>
              <FiStar className="store-section-title-icon" />
              Avis clients ({statsAvis.nombreAvis})
            </span>
            {statsAvis.nombreAvis > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {renderStars(Math.round(statsAvis.moyenne))}
                <span style={{ fontSize: '18px', fontWeight: '600' }}>{statsAvis.moyenne}/5</span>
              </div>
            )}
          </div>

          {/* Formulaire d'ajout d'avis */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '30px'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiSend /> Donner votre avis
            </h3>

            {avisMessage.text && (
              <div style={{
                padding: '12px 15px',
                marginBottom: '20px',
                borderRadius: '8px',
                backgroundColor: avisMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                color: avisMessage.type === 'success' ? '#155724' : '#721c24'
              }}>
                {avisMessage.text}
              </div>
            )}

            {isLoggedIn ? (
              <form onSubmit={handleSubmitAvis}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                    Votre note
                  </label>
                  {renderStars(newAvis.note, true, (note) => setNewAvis({ ...newAvis, note }))}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                    Votre commentaire (optionnel)
                  </label>
                  <textarea
                    value={newAvis.commentaire}
                    onChange={(e) => setNewAvis({ ...newAvis, commentaire: e.target.value })}
                    placeholder="Partagez votre expérience avec ce produit..."
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '15px',
                      border: '1px solid #ddd',
                      borderRadius: '10px',
                      fontSize: '15px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={avisLoading}
                  style={{
                    padding: '14px 30px',
                    background: 'var(--store-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: avisLoading ? 'not-allowed' : 'pointer',
                    opacity: avisLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FiSend /> {avisLoading ? 'Envoi en cours...' : 'Publier mon avis'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#666', marginBottom: '15px' }}>
                  Connectez-vous pour laisser un avis
                </p>
                <Link
                  to="/store/login"
                  style={{
                    padding: '12px 25px',
                    background: 'var(--store-primary)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                >
                  Se connecter
                </Link>
              </div>
            )}
          </div>

          {/* Liste des avis */}
          {avis.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '50px 20px', 
              color: '#999',
              background: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <FiStar size={50} style={{ marginBottom: '15px', opacity: 0.3 }} />
              <p>Aucun avis pour ce produit. Soyez le premier à donner votre avis !</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {avis.map((review) => (
                <div
                  key={review.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '25px',
                    boxShadow: '0 2px 15px rgba(0,0,0,0.06)',
                    border: '1px solid #eee'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--store-primary) 0%, #667eea 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '20px'
                      }}>
                        {review.clientNom?.charAt(0)?.toUpperCase() || <FiUser />}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                          {review.clientNom}
                        </div>
                        <div style={{ color: '#999', fontSize: '13px' }}>
                          {formatDate(review.dateAvis)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {renderStars(review.note)}
                      <span style={{ 
                        background: review.estPositif ? '#d4edda' : '#f8d7da',
                        color: review.estPositif ? '#155724' : '#721c24',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {review.estPositif ? <><FiThumbsUp size={12} /> Positif</> : <><FiThumbsDown size={12} /> Négatif</>}
                      </span>
                    </div>
                  </div>

                  {review.commentaire && (
                    <p style={{ 
                      margin: 0, 
                      color: '#444', 
                      lineHeight: '1.7',
                      fontSize: '15px'
                    }}>
                      "{review.commentaire}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <StoreFooter />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default StoreProduct;
