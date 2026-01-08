import React, { useState, useRef, useEffect } from 'react';
import { 
  FiMessageCircle, 
  FiX, 
  FiSend, 
  FiUser, 
  FiCpu,
  FiMinimize2,
  FiMaximize2,
  FiHelpCircle,
  FiChevronDown
} from 'react-icons/fi';
import storeService from '../../services/storeService';
import '../../styles/SupportChat.css';

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = [
    "Comment passer une commande ?",
    "Quels sont les modes de paiement ?",
    "Comment suivre ma commande ?",
    "Politique de retour"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      const response = await storeService.askSupport(messageText.trim());
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.answer,
        found: response.found,
        sources: response.sources || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleChat = () => {
    if (isOpen && !isMinimized) {
      setIsOpen(false);
    } else if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`support-chat-button ${isOpen ? 'active' : ''}`}
        onClick={toggleChat}
        aria-label="Ouvrir le chat support"
      >
        {isOpen ? (
          <FiChevronDown className="support-chat-button-icon" />
        ) : (
          <>
            <FiMessageCircle className="support-chat-button-icon" />
            <span className="support-chat-button-pulse"></span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`support-chat-window ${isMinimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="support-chat-header">
            <div className="support-chat-header-info">
              <div className="support-chat-avatar">
                <FiCpu />
                <span className="support-chat-status"></span>
              </div>
              <div className="support-chat-header-text">
                <h3>Support Client</h3>
                <span className="support-chat-status-text">
                  {isLoading ? 'En train d\'écrire...' : 'En ligne'}
                </span>
              </div>
            </div>
            <div className="support-chat-header-actions">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="support-chat-header-btn"
                aria-label={isMinimized ? 'Agrandir' : 'Réduire'}
              >
                {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="support-chat-header-btn"
                aria-label="Fermer"
              >
                <FiX />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          {!isMinimized && (
            <>
              <div className="support-chat-messages">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`support-chat-message ${message.type} ${message.isError ? 'error' : ''}`}
                  >
                    <div className="support-chat-message-avatar">
                      {message.type === 'user' ? <FiUser /> : <FiCpu />}
                    </div>
                    <div className="support-chat-message-content">
                      <div className="support-chat-message-bubble">
                        <p>{message.text}</p>
                        {message.sources && message.sources.length > 0 && (
                          <div className="support-chat-sources">
                            <span className="support-chat-sources-label">
                              <FiHelpCircle /> Sources
                            </span>
                            {message.sources.slice(0, 2).map((source, index) => (
                              <div key={index} className="support-chat-source-item">
                                <span className="source-type">
                                  {source.source_type === 'faq' ? 'FAQ' : 'Produit'}
                                </span>
                                <span className="source-confidence">
                                  {Math.round(source.confidence * 100)}% pertinent
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="support-chat-message-time">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="support-chat-message bot">
                    <div className="support-chat-message-avatar">
                      <FiCpu />
                    </div>
                    <div className="support-chat-message-content">
                      <div className="support-chat-message-bubble">
                        <div className="support-chat-typing">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {showSuggestions && messages.length <= 1 && (
                <div className="support-chat-suggestions">
                  <span className="support-chat-suggestions-label">Questions frequentes :</span>
                  <div className="support-chat-suggestions-list">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="support-chat-suggestion-btn"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="support-chat-input-area">
                <div className="support-chat-input-container">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ecrivez votre message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="support-chat-input"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isLoading}
                    className="support-chat-send-btn"
                    aria-label="Envoyer"
                  >
                    <FiSend />
                  </button>
                </div>
                <span className="support-chat-powered">
                  Propulse par IA
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SupportChat;
