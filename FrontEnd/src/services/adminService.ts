import api from '../utils/api';
import type { AvailabilitySlot, CreateAvailabilitySlotData } from '../types';

// Ré-exporter les types pour compatibilité
export type { AvailabilitySlot, CreateAvailabilitySlotData } from '../types';

export const adminService = {
  // Disponibilités
  getAvailabilitySlots: async (params?: {
    date?: string;
    gender?: 'homme' | 'femme';
    available?: boolean;
  }): Promise<AvailabilitySlot[]> => {
    const response = await api.get<{ slots: AvailabilitySlot[] }>('/admin/availability-slots', { params });
    return response.data.slots;
  },

  createAvailabilitySlot: async (data: CreateAvailabilitySlotData): Promise<AvailabilitySlot> => {
    const response = await api.post<{ message: string; slot: AvailabilitySlot }>(
      '/admin/availability-slots',
      data
    );
    return response.data.slot;
  },

  updateAvailabilitySlot: async (id: number, data: Partial<AvailabilitySlot>): Promise<AvailabilitySlot> => {
    const response = await api.put<{ message: string; slot: AvailabilitySlot }>(
      `/admin/availability-slots/${id}`,
      data
    );
    return response.data.slot;
  },

  deleteAvailabilitySlot: async (id: number): Promise<void> => {
    await api.delete(`/admin/availability-slots/${id}`);
  },
};
