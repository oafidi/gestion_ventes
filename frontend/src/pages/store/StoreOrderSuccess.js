import React from 'react';
import { Link } from 'react-router-dom';
import { StoreHeader, StoreFooter } from './StoreHome';
import { useCart } from '../../context/CartContext';
import { FiCheck, FiShoppingBag, FiList } from 'react-icons/fi';
import '../../styles/Store.css';

const StoreOrderSuccess = () => {
  const { getCartCount } = useCart();
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <div className="store-container">
      <StoreHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        cartCount={getCartCount()}
        onCartClick={() => {}}
      />

      <div className="store-wrapper">
        <div className="store-success-page">
          <div className="store-success-icon"><FiCheck size={50} /></div>
          <h1>Commande confirmée!</h1>
          <p>
            Merci pour votre commande. Vous recevrez bientôt un email de confirmation
            avec les détails de votre commande.
          </p>
          <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <Link to="/store/shop" className="store-btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiShoppingBag /> Continuer les achats
            </Link>
            <Link to="/store/account" className="store-btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiList /> Mes commandes
            </Link>
          </div>
        </div>
      </div>

      <StoreFooter />
    </div>
  );
};

export default StoreOrderSuccess;