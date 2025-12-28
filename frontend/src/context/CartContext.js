import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      const stockDisponible = product.quantiteStock || 0;
      
      if (existingItem) {
        // Vérifier que la nouvelle quantité ne dépasse pas le stock
        const nouvelleQuantite = Math.min(existingItem.quantity + quantity, stockDisponible);
        if (nouvelleQuantite <= existingItem.quantity) {
          // Stock déjà atteint, ne pas modifier
          return prevItems;
        }
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: nouvelleQuantite }
            : item
        );
      }
      
      // Nouveau produit - vérifier le stock
      const quantiteAjoutee = Math.min(quantity, stockDisponible);
      if (quantiteAjoutee <= 0) {
        return prevItems; // Stock épuisé
      }
      return [...prevItems, { ...product, quantity: quantiteAjoutee }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId) {
          // Limiter la quantité au stock disponible
          const maxQuantity = item.quantiteStock || 0;
          const newQuantity = Math.min(quantity, maxQuantity);
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.prixVendeur * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Vérifier si un produit est en stock
  const isInStock = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    if (!item) return true;
    return item.quantity < (item.quantiteStock || 0);
  };

  // Obtenir la quantité restante disponible pour un produit
  const getRemainingStock = (product) => {
    const cartItem = cartItems.find(item => item.id === product.id);
    const stockTotal = product.quantiteStock || 0;
    const quantiteDansPanier = cartItem ? cartItem.quantity : 0;
    return stockTotal - quantiteDansPanier;
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      isInStock,
      getRemainingStock
    }}>
      {children}
    </CartContext.Provider>
  );
};
