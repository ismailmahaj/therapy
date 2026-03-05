import api from '../utils/api';
import { tokenStorage, userStorage } from '../utils/jwt';
import type { User, RegisterData, LoginData, AuthResponse } from '../types';

// Ré-exporter les types pour compatibilité
export type { User, RegisterData, LoginData, AuthResponse } from '../types';

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/register', data);
    if (response.data.token) {
      tokenStorage.set(response.data.token);
      userStorage.set(response.data.user);
    }
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/login', data);
    if (response.data.token) {
      tokenStorage.set(response.data.token);
      userStorage.set(response.data.user);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/logout');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Logout error:', error);
      }
    } finally {
      tokenStorage.remove();
      userStorage.remove();
    }
  },

  me: async (): Promise<User> => {
    const response = await api.get<{ user: User }>('/me');
    userStorage.set(response.data.user);
    return response.data.user;
  },

  verifyEmail: async (id: string, hash: string): Promise<void> => {
    await api.post('/verify-email', { id, hash });
  },
};
