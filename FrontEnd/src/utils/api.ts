import axios from 'axios';
import { tokenStorage, clearStorage } from './jwt';

// Configuration de l'URL de l'API
// En production, doit être une URL HTTPS publique
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Détection et correction automatique des URLs internes Railway en production
if (import.meta.env.PROD) {
  // Détecter les URLs internes Railway
  if (API_BASE_URL.includes('railway.internal') || API_BASE_URL.includes('.railway.internal')) {
    console.error('❌ ERREUR: VITE_API_URL utilise une URL interne Railway !');
    console.error('   URL actuelle:', API_BASE_URL);
    console.error('   Solution: Configurez VITE_API_URL avec l\'URL HTTPS publique de votre backend dans Railway');
    console.error('   Exemple: https://votre-backend.up.railway.app/api');
    // Ne pas utiliser l'URL interne, utiliser une URL relative ou afficher une erreur claire
    API_BASE_URL = '/api'; // Fallback vers une URL relative (nécessite un proxy)
  }
  
  // Détecter localhost en production
  if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
    console.error('⚠️ VITE_API_URL pointe vers localhost en production !');
    console.error('   Configurez VITE_API_URL avec l\'URL HTTPS publique de votre backend');
  }
  
  // Détecter HTTP au lieu de HTTPS
  if (API_BASE_URL.startsWith('http://') && !API_BASE_URL.includes('localhost')) {
    console.warn('⚠️ VITE_API_URL utilise HTTP au lieu de HTTPS en production !');
    console.warn('   Cela peut causer des erreurs "Mixed Content"');
  }
}

// Log de l'URL utilisée (toujours affiché pour débogage)
console.log('🌐 API Base URL configurée:', API_BASE_URL);
console.log('📦 VITE_API_URL depuis env:', import.meta.env.VITE_API_URL);
console.log('🔍 Mode:', import.meta.env.MODE);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      clearStorage();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
