/**
 * api.js:
 * - Instanță Axios preconfigurată pentru comunicarea cu backend-ul.
 * - Adaugă automat token-ul JWT în header-ul Authorization pentru toate cererile.
 * - Folosește URL-ul din variabila de mediu VITE_API_BASE_URL sau fallback la localhost.
 *
 * Exemplu utilizare:
 * import api from './api';
 * api.get('/api/products/')
 *    .then(res => console.log(res.data));
 */

import axios from 'axios';
import { ACCESS_TOKEN } from '../constants';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
})

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

// VALENTIN - 14.12.2025 
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesiune expirată sau utilizator invalid. Delogare automată...");
      
      localStorage.clear();

      window.location.href = "/auth";
    }
    
    return Promise.reject(error);
  }
);

export default api;