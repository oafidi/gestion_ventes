import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import storeService from '../services/storeService';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Clé localStorage pour le panier des visiteurs non connectés
const GUEST_CART_KEY = 'cart_guest';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Vérifier si l'utilisateur est connecté ET est un CLIENT
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        isAuthenticated: true,
        isClient: user.role === 'CLIENT'
      };
    }
    return { isAuthenticated: false, isClient: false };
  }, []);

  // Charger le panier depuis le backend (pour les utilisateurs connectés)
  const loadCartFromBackend = useCallback(async () => {
    try {
      setLoading(true);
      console.log('=== Chargement du panier depuis le backend ===');
      const response = await storeService.getPanier();
      console.log('Réponse du backend:', response);
      
      // Vérifier que lignesPanier existe
      if (!response || !response.lignesPanier) {
        console.log('Panier vide ou non trouvé');
        setCartItems([]);
        return;
      }
      
      // Transformer les données du backend vers le format frontend
      const items = response.lignesPanier.map(ligne => ({
        id: ligne.vendeurProduitId,
        produitNom: ligne.produitNom,
        titre: ligne.produitTitre,
        image: ligne.produitImage,
        vendeurNom: ligne.vendeurNom,
        prixVendeur: ligne.prixUnitaire,
        quantity: ligne.quantite,
        quantiteStock: ligne.stockDisponible + ligne.quantite // Stock total = stock dispo + quantité dans panier
      }));
      console.log('Items transformés:', items);
      setCartItems(items);
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      // En cas d'erreur 401/403, ne pas écraser le panier actuel
      // L'utilisateur devra se reconnecter manuellement
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Erreur d\'authentification - panier non modifié');
        return;
      }
      // Pour les autres erreurs, utiliser le localStorage comme fallback
      const savedCart = localStorage.getItem(GUEST_CART_KEY);
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger le panier depuis le localStorage (pour les visiteurs)
  const loadCartFromLocalStorage = useCallback(() => {
    const savedCart = localStorage.getItem(GUEST_CART_KEY);
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
  }, []);

  // Initialisation et écoute des changements d'authentification
  useEffect(() => {
    const { isAuthenticated: auth, isClient: client } = checkAuth();
    setIsAuthenticated(auth);
    setIsClient(client);
    
    if (auth && client) {
      loadCartFromBackend();
    } else {
      loadCartFromLocalStorage();
    }

    // Vérifier périodiquement les changements d'authentification (toutes les 2 secondes)
    const interval = setInterval(() => {
      const { isAuthenticated: newAuth, isClient: newClient } = checkAuth();
      if (newAuth !== isAuthenticated || newClient !== isClient) {
        setIsAuthenticated(newAuth);
        setIsClient(newClient);
        if (newAuth && newClient) {
          loadCartFromBackend();
        } else {
          loadCartFromLocalStorage();
        }
      }
    }, 2000); // Augmenté de 500ms à 2000ms pour éviter les conflits

    return () => clearInterval(interval);
  }, [checkAuth, isAuthenticated, isClient, loadCartFromBackend, loadCartFromLocalStorage]);

  // Sauvegarder le panier en localStorage UNIQUEMENT pour les visiteurs non authentifiés
  useEffect(() => {
    // Ne sauvegarder en localStorage que si l'utilisateur n'est PAS un client authentifié
    if (!isAuthenticated) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // Ajouter un produit au panier
  const addToCart = async (product, quantity = 1) => {
    console.log('=== addToCart ===');
    console.log('isClient:', isClient);
    console.log('product:', product);
    console.log('quantity:', quantity);
    
    if (isClient) {
      try {
        setLoading(true);
        console.log('Appel API ajouterAuPanier...');
        const response = await storeService.ajouterAuPanier(product.id, quantity);
        console.log('Réponse ajouterAuPanier:', response);
        await loadCartFromBackend();
      } catch (error) {
        console.error('Erreur lors de l\'ajout au panier:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      console.log('Mode localStorage (non-client)');
      // Mode visiteur ou non-client - localStorage
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        const stockDisponible = product.quantiteStock || 0;
        
        if (existingItem) {
          const nouvelleQuantite = Math.min(existingItem.quantity + quantity, stockDisponible);
          if (nouvelleQuantite <= existingItem.quantity) {
            return prevItems;
          }
          return prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: nouvelleQuantite }
              : item
          );
        }
        
        const quantiteAjoutee = Math.min(quantity, stockDisponible);
        if (quantiteAjoutee <= 0) {
          return prevItems;
        }
        return [...prevItems, { ...product, quantity: quantiteAjoutee }];
      });
    }
  };

  // Supprimer un produit du panier
  const removeFromCart = async (productId) => {
    if (isClient) {
      try {
        setLoading(true);
        await storeService.supprimerDuPanier(productId);
        await loadCartFromBackend();
      } catch (error) {
        console.error('Erreur lors de la suppression du panier:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    }
  };

  // Modifier la quantité d'un produit
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (isClient) {
      try {
        setLoading(true);
        await storeService.modifierQuantitePanier(productId, quantity);
        await loadCartFromBackend();
      } catch (error) {
        console.error('Erreur lors de la modification de la quantité:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems(prevItems =>
        prevItems.map(item => {
          if (item.id === productId) {
            const maxQuantity = item.quantiteStock || 0;
            const newQuantity = Math.min(quantity, maxQuantity);
            return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
          }
          return item;
        })
      );
    }
  };

  // Vider le panier
  const clearCart = async () => {
    if (isClient) {
      try {
        setLoading(true);
        await storeService.viderPanier();
        setCartItems([]);
      } catch (error) {
        console.error('Erreur lors du vidage du panier:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems([]);
    }
  };

  // Vider le panier localement sans appel API (utilisé après une commande réussie)
  const clearCartLocal = () => {
    setCartItems([]);
  };

  // Calculer le total du panier
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.prixVendeur * item.quantity), 0);
  };

  // Compter le nombre de produits dans le panier
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

  // Synchroniser le panier avec l'utilisateur courant (à appeler après login/logout)
  const syncWithUser = async () => {
    console.log('=== syncWithUser appelé ===');
    const { isAuthenticated: auth, isClient: client } = checkAuth();
    console.log('auth:', auth, 'client:', client);
    
    setIsAuthenticated(auth);
    setIsClient(client);
    
    if (auth && client) {
      // Client connecté - charger le panier depuis la base de données
      console.log('Chargement du panier depuis le backend...');
      await loadCartFromBackend();
    } else {
      // Non connecté ou non-client - charger le panier guest depuis localStorage
      console.log('Chargement du panier guest depuis localStorage...');
      const savedCart = localStorage.getItem(GUEST_CART_KEY);
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      clearCartLocal,
      getCartTotal,
      getCartCount,
      isInStock,
      getRemainingStock,
      syncWithUser,
      isAuthenticated,
      isClient
    }}>
      {children}
    </CartContext.Provider>
  );
};