import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PrivateRoute, DashboardLayout } from './components';
import { Login } from './pages/auth';
import { VendeurLogin, VendeurSignup } from './pages/vendeur-auth';
import { VendeurDashboard } from './pages/vendeur-dashboard';
import { 
  StoreHome, 
  StoreShop, 
  StoreProduct, 
  StoreCheckout, 
  StoreOrderSuccess, 
  StoreLogin, 
  StoreAccount,
  StoreContact
} from './pages/store';
import './App.css';

// Composant pour protéger les routes vendeur
const VendeurPrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || user.role !== 'VENDEUR') {
    return <Navigate to="/vendeur/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Routes Store (Client) */}
              <Route path="/store" element={<StoreHome />} />
              <Route path="/store/shop" element={<StoreShop />} />
              <Route path="/store/product/:id" element={<StoreProduct />} />
              <Route path="/store/checkout" element={<StoreCheckout />} />
              <Route path="/store/order-success" element={<StoreOrderSuccess />} />
              <Route path="/store/login" element={<StoreLogin />} />
              <Route path="/store/account" element={<StoreAccount />} />
              <Route path="/store/contact" element={<StoreContact />} />

              {/* Routes Admin */}
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard/*" 
                element={
                  <PrivateRoute>
                    <DashboardLayout />
                  </PrivateRoute>
                } 
              />

              {/* Routes Vendeur */}
              <Route path="/vendeur/login" element={<VendeurLogin />} />
              <Route path="/vendeur/signup" element={<VendeurSignup />} />
              <Route 
                path="/vendeur/dashboard/*" 
                element={
                  <VendeurPrivateRoute>
                    <VendeurDashboard />
                  </VendeurPrivateRoute>
                } 
              />

              {/* Redirection par défaut vers le store */}
              <Route path="/" element={<Navigate to="/store" replace />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
