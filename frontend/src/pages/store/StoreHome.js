import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import storeService from '../../services/storeService';
import { getImageUrl } from '../../config/apiConfig';
import { 
  FiShoppingCart, 
  FiUser, 
  FiSearch, 
  FiPhone, 
  FiTruck, 
  FiX,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiLock,
  FiGrid,
  FiStar,
  FiArrowRight,
  FiPackage,
  FiShoppingBag,
  FiFolder
} from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import '../../styles/Store.css';

const StoreHome = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart, getCartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

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
    addToCart({
      id: product.id,
      titre: product.titre || product.produitNom,
      prixVendeur: product.prixVendeur,
      image: product.image,
      vendeurNom: product.vendeurNom,
      description: product.description
    });
  };

  const filteredProducts = products.filter(product => {
    const title = product.titre || product.produitNom || '';
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

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

  return (
    <div className="store-container">
      <StoreHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        cartCount={getCartCount()}
        onCartClick={() => setCartOpen(true)}
      />

      {/* Hero Section */}
      <section className="store-hero">
        <div className="store-wrapper">
          <div className="store-hero-content">
            <h1>Découvrez les meilleures offres du moment</h1>
            <p>Des milliers de produits de qualité proposés par nos vendeurs partenaires. Livraison rapide et paiement sécurisé.</p>
            <Link to="/store/shop" className="store-hero-btn">
              <FiShoppingBag /> Explorer la boutique
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="store-section">
        <div className="store-wrapper">
          <div className="store-section-title">
            <span>
              <FiGrid className="store-section-title-icon" />
              Catégories
            </span>
            <Link to="/store/shop" className="store-view-all">
              Voir tout <FiArrowRight />
            </Link>
          </div>
          <div className="store-categories-grid">
            {categories.slice(0, 6).map(category => (
              <Link 
                key={category.id} 
                to={`/store/shop?category=${category.id}`}
                className="store-category-card"
              >
                {category.image ? (
                  <img 
                    src={getImageUrl(category.image)} 
                    alt={category.nom}
                    className="store-category-image"
                  />
                ) : (
                  <div className="store-category-placeholder"><FiFolder size={40} /></div>
                )}
                <div className="store-category-name">{category.nom}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="store-section">
        <div className="store-wrapper">
          <div className="store-section-title">
            <span>
              <FiStar className="store-section-title-icon" />
              Produits en vedette
            </span>
            <Link to="/store/shop" className="store-view-all">
              Voir tout <FiArrowRight />
            </Link>
          </div>
          <div className="store-products-grid">
            {filteredProducts.slice(0, 8).map(product => (
              <div key={product.id} className="store-product-card">
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
                    <span className="store-product-badge">Nouveau</span>
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
                  <div className="store-product-price-row">
                    <span className="store-product-price">
                      {parseFloat(product.prixVendeur).toFixed(2)} DH
                    </span>
                    <button 
                      className="store-add-to-cart-btn"
                      onClick={(e) => handleAddToCart(product, e)}
                      title="Ajouter au panier"
                    >
                      <FiShoppingCart />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <StoreFooter />
      
      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

// Store Header Component
export const StoreHeader = ({ searchTerm, setSearchTerm, cartCount, onCartClick }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <header className="store-header">
      <div className="store-header-top">
        <div className="store-wrapper" style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.8)' }}>
          <span><FiTruck style={{ marginRight: '8px' }} /> Livraison gratuite</span>
          <span><FiPhone style={{ marginRight: '8px' }} /> Service client: +212 5XX-XXXXXX</span>
        </div>
      </div>
      <div className="store-header-main">
        <div className="store-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/store" className="store-logo">
            <span className="store-logo-icon"><FiShoppingBag /></span>
            VenteStore
          </Link>
          <div className="store-search">
            <input 
              type="text" 
              className="store-search-input"
              placeholder="Rechercher des produits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="store-header-actions">
            {user ? (
              <Link to="/store/account" className="store-header-btn">
                <span className="store-header-btn-icon"><FiUser /></span>
                {user.nom}
              </Link>
            ) : (
              <Link to="/store/login" className="store-header-btn">
                <span className="store-header-btn-icon"><FiUser /></span>
                Connexion
              </Link>
            )}
            <button className="store-header-btn" onClick={onCartClick}>
              <span className="store-header-btn-icon">
                <FiShoppingCart />
                {cartCount > 0 && (
                  <span className="store-cart-badge">{cartCount}</span>
                )}
              </span>
              Panier
            </button>
          </div>
        </div>
      </div>
      <nav className="store-nav">
        <div className="store-wrapper">
          <ul className="store-nav-list">
            <li><Link to="/store" className="store-nav-link">Accueil</Link></li>
            <li><Link to="/store/shop" className="store-nav-link">Boutique</Link></li>
            <li><Link to="/store/shop" className="store-nav-link">Catégories</Link></li>
            <li><Link to="/store/contact" className="store-nav-link">Contact</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

// Cart Sidebar Component
export const CartSidebar = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/store/checkout');
  };

  return (
    <>
      <div 
        className={`store-cart-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />
      <div className={`store-cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="store-cart-header">
          <h2><FiShoppingCart style={{ marginRight: '10px' }} /> Votre Panier</h2>
          <button className="store-cart-close" onClick={onClose}><FiX /></button>
        </div>
        
        <div className="store-cart-items">
          {cartItems.length === 0 ? (
            <div className="store-cart-empty">
              <div className="store-cart-empty-icon"><FiShoppingCart size={60} /></div>
              <p>Votre panier est vide</p>
              <Link to="/store/shop" onClick={onClose} className="store-hero-btn" style={{ display: 'inline-block', marginTop: '20px', fontSize: '14px', padding: '12px 25px' }}>
                Continuer vos achats
              </Link>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="store-cart-item">
                {item.image ? (
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.titre}
                    className="store-cart-item-image"
                  />
                ) : (
                  <div className="store-cart-item-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiShoppingBag size={24} /></div>
                )}
                <div className="store-cart-item-info">
                  <div className="store-cart-item-title">{item.titre}</div>
                  <div className="store-cart-item-vendor">Par {item.vendeurNom}</div>
                  <div className="store-cart-item-price">{parseFloat(item.prixVendeur).toFixed(2)} DH</div>
                  <div className="store-cart-item-quantity">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <FiMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= (item.quantiteStock || 999)}
                      style={item.quantity >= (item.quantiteStock || 999) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
                <button 
                  className="store-cart-item-remove"
                  onClick={() => removeFromCart(item.id)}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="store-cart-footer">
            <div className="store-cart-total">
              <span>Total:</span>
              <span className="store-cart-total-price">{getCartTotal().toFixed(2)} DH</span>
            </div>
            <button 
              className="store-checkout-btn"
              onClick={handleCheckout}
            >
              <FiLock style={{ marginRight: '8px' }} /> Passer la commande
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Store Footer Component
export const StoreFooter = () => {
  return (
    <footer className="store-footer">
      <div className="store-wrapper">
        <div className="store-footer-grid">
          <div className="store-footer-section">
            <h4>À Propos</h4>
            <ul>
              <li><a href="#">Qui sommes-nous</a></li>
              <li><a href="#">Nos vendeurs</a></li>
              <li><a href="#">Carrières</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
          <div className="store-footer-section">
            <h4>Aide</h4>
            <ul>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Livraison</a></li>
              <li><a href="#">Retours</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="store-footer-section">
            <h4>Légal</h4>
            <ul>
              <li><a href="#">CGV</a></li>
              <li><a href="#">Politique de confidentialité</a></li>
              <li><a href="#">Cookies</a></li>
              <li><a href="#">Mentions légales</a></li>
            </ul>
          </div>
          <div className="store-footer-section">
            <h4>Suivez-nous</h4>
            <ul>
              <li><a href="#"><FaFacebook style={{ marginRight: '8px' }} /> Facebook</a></li>
              <li><a href="#"><FaInstagram style={{ marginRight: '8px' }} /> Instagram</a></li>
              <li><a href="#"><FaTwitter style={{ marginRight: '8px' }} /> Twitter</a></li>
              <li><a href="#"><FaYoutube style={{ marginRight: '8px' }} /> YouTube</a></li>
            </ul>
          </div>
        </div>
        <div className="store-footer-bottom">
          <p>© 2025 VenteStore. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default StoreHome;
