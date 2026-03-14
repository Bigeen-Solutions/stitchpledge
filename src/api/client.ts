import axios from 'axios';
import { setupInterceptors } from './interceptors.ts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for HttpOnly cookies (refresh tokens)
});

// Initialize interceptors
setupInterceptors(apiClient);
