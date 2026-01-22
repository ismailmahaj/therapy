import api from '../utils/api';
import type { TherapySlot, Appointment, TherapistProfile } from '../types';

export type CreateSlotData = {
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  max_clients: number;
  location?: string;
  price?: number;
  notes?: string;
  hijama_type: string; // Nouveau : obligatoire
};

export type UpdateSlotData = Partial<CreateSlotData> & {
  statut?: 'available' | 'full' | 'cancelled';
};

export type CreateTherapistProfileData = {
  sexe: 'homme' | 'femme';
  hijama_types: string[];
  pratiques_personnalisees?: string[];
  autres_types?: string;
};

export const therapyService = {
  // Gestion des créneaux
  getSlots: async (params?: {
    date?: string;
    statut?: string;
    from?: string;
    to?: string;
  }): Promise<TherapySlot[]> => {
    const response = await api.get<{ data: TherapySlot[] }>('/therapy/slots', { params });
    return response.data.data || response.data;
  },

  getSlot: async (id: number): Promise<TherapySlot> => {
    const response = await api.get<{ slot: TherapySlot }>(`/therapy/slots/${id}`);
    return response.data.slot;
  },

  createSlot: async (data: CreateSlotData): Promise<TherapySlot> => {
    const response = await api.post<{ message: string; slot: TherapySlot }>('/therapy/slots', data);
    return response.data.slot;
  },

  updateSlot: async (id: number, data: UpdateSlotData): Promise<TherapySlot> => {
    const response = await api.patch<{ message: string; slot: TherapySlot }>(`/therapy/slots/${id}`, data);
    return response.data.slot;
  },

  deleteSlot: async (id: number): Promise<void> => {
    await api.delete(`/therapy/slots/${id}`);
  },

  getSlotAppointments: async (slotId: number): Promise<Appointment[]> => {
    const response = await api.get<{ slot: TherapySlot; appointments: Appointment[] }>(
      `/therapy/slots/${slotId}/appointments`
    );
    return response.data.appointments;
  },

  // Gestion des rendez-vous reçus
  getAppointments: async (params?: {
    statut?: string;
    date?: string;
    client_id?: number;
  }): Promise<Appointment[]> => {
    const response = await api.get<{ data: Appointment[] }>('/therapy/appointments', { params });
    return response.data.data || response.data;
  },

  getAppointment: async (id: number): Promise<Appointment> => {
    const response = await api.get<{ appointment: Appointment }>(`/therapy/appointments/${id}`);
    return response.data.appointment;
  },

  completeAppointment: async (id: number, therapistNotes?: string): Promise<Appointment> => {
    const response = await api.patch<{ message: string; appointment: Appointment }>(
      `/therapy/appointments/${id}/complete`,
      { therapist_notes: therapistNotes }
    );
    return response.data.appointment;
  },

  // Profil thérapeute
  getProfile: async (): Promise<TherapistProfile | null> => {
    try {
      const response = await api.get<{ profile: TherapistProfile }>('/therapy/profile');
      return response.data.profile;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createOrUpdateProfile: async (data: CreateTherapistProfileData): Promise<TherapistProfile> => {
    const response = await api.post<{ message: string; profile: TherapistProfile }>('/therapy/profile', data);
    return response.data.profile;
  },

  updateProfile: async (data: CreateTherapistProfileData): Promise<TherapistProfile> => {
    const response = await api.patch<{ message: string; profile: TherapistProfile }>('/therapy/profile', data);
    return response.data.profile;
  },

  // Disponibilités récurrentes
  getRecurringAvailabilities: async (): Promise<any[]> => {
    const response = await api.get<{ availabilities: any[] }>(
      '/therapy/calendar/recurring-availabilities'
    );
    return response.data.availabilities;
  },

  createRecurringAvailability: async (data: any): Promise<any> => {
    const response = await api.post<{ message: string; availability: any }>(
      '/therapy/calendar/recurring-availabilities',
      data
    );
    return response.data.availability;
  },

  updateRecurringAvailability: async (
    id: number,
    data: any
  ): Promise<any> => {
    const response = await api.patch<{ message: string; availability: any }>(
      `/therapy/calendar/recurring-availabilities/${id}`,
      data
    );
    return response.data.availability;
  },

  deleteRecurringAvailability: async (id: number, deleteFutureSlots?: boolean): Promise<void> => {
    await api.delete(`/therapy/calendar/recurring-availabilities/${id}`, {
      params: { delete_future_slots: deleteFutureSlots },
    });
  },

  // Génération de slots
  generateSlots: async (fromDate: string, toDate: string): Promise<{ message: string; slots_created: number }> => {
    const response = await api.post<{ message: string; slots_created: number }>(
      '/therapy/calendar/generate-slots',
      { from_date: fromDate, to_date: toDate }
    );
    return response.data;
  },
};
