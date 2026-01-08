// Configuration centralisée pour les URLs de l'API
// Gère automatiquement la communication WSL -> Windows

const getBackendUrl = () => {
  const hostname = window.location.hostname;
  // Si on accède via une IP WSL (172.x.x.x), utiliser l'IP Windows
  if (hostname.startsWith('172.')) {
    return 'http://172.17.16.1:8080';
  }
  // Sinon utiliser le même hostname
  return `http://${hostname}:8080`;
};

const getAIServiceUrl = () => {
  // Service AI Python FastAPI
  return 'http://127.0.0.1:8000';
};

export const BACKEND_URL = getBackendUrl();
export const API_URL = `${BACKEND_URL}/api`;
export const AI_SERVICE_URL = getAIServiceUrl();

// Helper pour construire les URLs d'images
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${BACKEND_URL}${imagePath}`;
};
