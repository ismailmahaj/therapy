import api from '../utils/api';
import type { Appointment, CreateAppointmentData, TherapySlot } from '../types';

// Ré-exporter les types pour compatibilité
export type { Appointment, CreateAppointmentData } from '../types';

export type CreateAppointmentResponse = {
  message: string;
  appointment: Appointment;
  client_secret: string;
};

export const appointmentService = {
  // Utiliser les nouvelles routes V2
  getAll: async (): Promise<Appointment[]> => {
    const response = await api.get<{ data: Appointment[] }>('/client/therapy/appointments');
    return response.data.data || response.data;
  },

  getById: async (id: number): Promise<Appointment> => {
    const response = await api.get<{ appointment: Appointment }>(`/client/therapy/appointments/${id}`);
    return response.data.appointment;
  },

  // Créer un rendez-vous (nouvelle structure V2)
  create: async (data: CreateAppointmentData): Promise<CreateAppointmentResponse> => {
    const response = await api.post<CreateAppointmentResponse>('/client/therapy/appointments', data);
    return response.data;
  },

  // Créer plusieurs rendez-vous en une fois (pour personnes de sexes différents)
  createMultiple: async (appointments: CreateAppointmentData[]): Promise<{
    message: string;
    appointments: Appointment[];
    client_secret: string;
    total_amount: number;
  }> => {
    const response = await api.post<{
      message: string;
      appointments: Appointment[];
      client_secret: string;
      total_amount: number;
    }>('/client/therapy/appointments/multiple', { appointments });
    return response.data;
  },

  // Confirmer le paiement
  confirmPayment: async (paymentIntentId: string): Promise<Appointment> => {
    const response = await api.post<{ message: string; appointment: Appointment }>(
      '/client/therapy/appointments/confirm-payment',
      { payment_intent_id: paymentIntentId }
    );
    return response.data.appointment;
  },

  cancel: async (id: number): Promise<Appointment> => {
    const response = await api.patch<{ message: string; appointment: Appointment }>(
      `/client/therapy/appointments/${id}/cancel`
    );
    return response.data.appointment;
  },

  // Obtenir les créneaux disponibles
  getAvailableSlots: async (params?: {
    date?: string;
    therapist_id?: number;
    from_date?: string;
    to_date?: string;
    client_sexe?: 'homme' | 'femme'; // Nouveau : filtre par sexe
    hijama_type?: string; // Nouveau : filtre par type de hijama
  }): Promise<TherapySlot[]> => {
    const response = await api.get<{ slots: TherapySlot[] }>('/client/therapy/slots/available', { params });
    return response.data.slots;
  },

  // Obtenir les thérapeutes
  getTherapists: async (): Promise<User[]> => {
    const response = await api.get<{ therapists: User[] }>('/client/therapy/therapists');
    return response.data.therapists;
  },

  // Obtenir les créneaux d'un thérapeute
  getTherapistSlots: async (therapistId: number, params?: {
    from_date?: string;
    to_date?: string;
  }): Promise<TherapySlot[]> => {
    const response = await api.get<{ slots: TherapySlot[] }>(
      `/client/therapy/therapists/${therapistId}/slots`,
      { params }
    );
    return response.data.slots;
  },
};

import type { User } from '../types';
