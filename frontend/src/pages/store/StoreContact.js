import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { StoreHeader, StoreFooter, CartSidebar } from './StoreHome';
import { FiPhone, FiMapPin, FiMail, FiClock, FiSend, FiCheck, FiHelpCircle, FiEdit3 } from 'react-icons/fi';
import '../../styles/Store.css';

const StoreContact = () => {
  const { getCartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="store-container">
      <StoreHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        cartCount={getCartCount()}
        onCartClick={() => setCartOpen(true)}
      />

      <div className="store-wrapper" style={{ padding: '40px 20px' }}>
        {/* Breadcrumb */}
        <div className="store-breadcrumb">
          <Link to="/store">Accueil</Link>
          <span>/</span>
          <span style={{ color: 'var(--store-gray-700)' }}>Contact</span>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '10px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><FiPhone /> Contactez-nous</h1>
          <p style={{ textAlign: 'center', color: 'var(--store-gray-500)', marginBottom: '40px' }}>
            Une question? Notre équipe est là pour vous aider.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Contact Info */}
            <div>
              <div className="store-checkout-section">
                <h2 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}><FiMapPin /> Nos coordonnées</h2>
                
                <div style={{ marginBottom: '25px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px' }}>
                    <FiMapPin size={24} style={{ color: 'var(--store-primary)' }} />
                    <div>
                      <strong>Adresse</strong>
                      <p style={{ color: 'var(--store-gray-500)', margin: '5px 0 0', fontSize: '14px' }}>
                        123 Avenue Mohammed V<br />
                        Casablanca, Maroc
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px' }}>
                    <FiPhone size={24} style={{ color: 'var(--store-primary)' }} />
                    <div>
                      <strong>Téléphone</strong>
                      <p style={{ color: 'var(--store-gray-500)', margin: '5px 0 0', fontSize: '14px' }}>
                        +212 5XX-XXXXXX<br />
                        Lun - Ven: 9h - 18h
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', marginBottom: '20px' }}>
                    <FiMail size={24} style={{ color: 'var(--store-primary)' }} />
                    <div>
                      <strong>Email</strong>
                      <p style={{ color: 'var(--store-gray-500)', margin: '5px 0 0', fontSize: '14px' }}>
                        contact@ventestore.ma<br />
                        support@ventestore.ma
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  background: 'var(--store-gray-100)', 
                  padding: '20px', 
                  borderRadius: 'var(--store-radius-sm)' 
                }}>
                  <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiClock /> Horaires d'ouverture</h4>
                  <p style={{ fontSize: '14px', color: 'var(--store-gray-500)', margin: 0 }}>
                    Lundi - Vendredi: 9h00 - 18h00<br />
                    Samedi: 10h00 - 14h00<br />
                    Dimanche: Fermé
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="store-checkout-section">
                <h2 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}><FiEdit3 /> Envoyez-nous un message</h2>

                {submitted ? (
                  <div className="store-alert store-alert-success" style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '10px' }}><FiCheck size={40} /></div>
                    <strong>Message envoyé!</strong>
                    <p style={{ margin: '10px 0 0' }}>Nous vous répondrons dans les plus brefs délais.</p>
                    <button 
                      onClick={() => setSubmitted(false)}
                      className="store-btn-primary"
                      style={{ marginTop: '20px', padding: '10px 20px' }}
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="store-form-group">
                      <label className="store-form-label">Nom complet</label>
                      <input
                        type="text"
                        name="name"
                        className="store-form-input"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Votre nom"
                      />
                    </div>
                    <div className="store-form-group">
                      <label className="store-form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="store-form-input"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="votre@email.com"
                      />
                    </div>
                    <div className="store-form-group">
                      <label className="store-form-label">Sujet</label>
                      <input
                        type="text"
                        name="subject"
                        className="store-form-input"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Sujet de votre message"
                      />
                    </div>
                    <div className="store-form-group">
                      <label className="store-form-label">Message</label>
                      <textarea
                        name="message"
                        className="store-form-input"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="5"
                        required
                        placeholder="Votre message..."
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                    <button type="submit" className="store-form-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <FiSend /> Envoyer le message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="store-checkout-section" style={{ marginTop: '40px' }}>
            <h2 style={{ marginBottom: '25px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><FiHelpCircle /> Questions fréquentes</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '20px', background: 'var(--store-gray-100)', borderRadius: 'var(--store-radius-sm)' }}>
                <strong>Comment puis-je suivre ma commande?</strong>
                <p style={{ color: 'var(--store-gray-500)', fontSize: '14px', margin: '10px 0 0' }}>
                  Connectez-vous à votre compte et accédez à "Mes commandes" pour voir le statut de vos commandes.
                </p>
              </div>
              <div style={{ padding: '20px', background: 'var(--store-gray-100)', borderRadius: 'var(--store-radius-sm)' }}>
                <strong>Quels sont les délais de livraison?</strong>
                <p style={{ color: 'var(--store-gray-500)', fontSize: '14px', margin: '10px 0 0' }}>
                  Les délais varient selon votre localisation, généralement entre 2 et 5 jours ouvrables.
                </p>
              </div>
              <div style={{ padding: '20px', background: 'var(--store-gray-100)', borderRadius: 'var(--store-radius-sm)' }}>
                <strong>Comment retourner un article?</strong>
                <p style={{ color: 'var(--store-gray-500)', fontSize: '14px', margin: '10px 0 0' }}>
                  Vous avez 14 jours pour retourner un article. Contactez-nous pour initier le processus de retour.
                </p>
              </div>
              <div style={{ padding: '20px', background: 'var(--store-gray-100)', borderRadius: 'var(--store-radius-sm)' }}>
                <strong>Le paiement est-il sécurisé?</strong>
                <p style={{ color: 'var(--store-gray-500)', fontSize: '14px', margin: '10px 0 0' }}>
                  Oui, nous proposons le paiement à la livraison pour votre tranquillité d'esprit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StoreFooter />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default StoreContact;
