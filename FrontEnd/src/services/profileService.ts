import api from '../utils/api';
import type { User } from '../types';

export type UpdateProfileData = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  sexe?: 'homme' | 'femme';
  avatar?: string;
  bio?: string;
  specialization?: string;
  password?: string;
  password_confirmation?: string;
  current_password?: string;
};

export const profileService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<{ user: User }>('/profile');
    return response.data.user;
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.patch<{ message: string; user: User }>('/profile', data);
    return response.data.user;
  },
};
